import { useEffect, useState, useCallback } from 'react'
import { Check, X, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { API_BASE } from '../config.js'

const TOKEN_KEY = 'ft_admin_token'

async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('request-failed')
  return res.status === 204 ? null : res.json()
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : '—'
}

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [tokenInput, setTokenInput] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [requests, setRequests] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (t) => {
    setLoading(true)
    setError('')
    try {
      const [reqData, agentData] = await Promise.all([
        apiFetch('/api/requests', { token: t }),
        apiFetch('/api/agents', { token: t }),
      ])
      setRequests(reqData)
      setAgents(agentData)
      setAuthed(true)
    } catch (err) {
      if (err.message === 'unauthorized') {
        setError('That token was rejected. Check it and try again.')
        sessionStorage.removeItem(TOKEN_KEY)
        setToken('')
        setAuthed(false)
      } else {
        setError('Could not reach the backend. Is it running?')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) load(token)
  }, [token, load])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    sessionStorage.setItem(TOKEN_KEY, tokenInput.trim())
    setToken(tokenInput.trim())
  }

  const handleRequestAction = async (id, action) => {
    try {
      await apiFetch(`/api/requests/${id}/${action}`, { method: 'PATCH', token })
      load(token)
    } catch {
      setError('That action failed. Please try again.')
    }
  }

  const handleAgentAction = async (id, action) => {
    try {
      await apiFetch(`/api/agents/${id}/${action}`, { method: 'PATCH', token })
      load(token)
    } catch {
      setError('That action failed. Please try again.')
    }
  }

  if (!authed) {
    return (
      <div className="admin-gate">
        <form onSubmit={handleLogin} className="admin-gate-card">
          <h1>Admin access</h1>
          <p>Enter the admin token to review requests and agent applications.</p>
          <div className="admin-token-field">
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="Admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="admin-token-toggle"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn btn-primary" type="submit">Continue</button>
          {error && <p className="admin-error">{error}</p>}
        </form>
        <style>{adminStyles}</style>
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const otherRequests = requests.filter((r) => r.status !== 'pending')
  const pendingAgents = agents.filter((a) => a.status === 'pending')
  const otherAgents = agents.filter((a) => a.status !== 'pending')

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Frajan Tech — Admin</h1>
        <button className="btn btn-ghost" onClick={() => load(token)} disabled={loading}>
          <RefreshCw size={15} /> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <section>
        <h2>Pending requests ({pendingRequests.length})</h2>
        <RequestsTable rows={pendingRequests} onAction={handleRequestAction} showActions />
      </section>

      {otherRequests.length > 0 && (
        <section>
          <h2>Past requests</h2>
          <RequestsTable rows={otherRequests} />
        </section>
      )}

      <section>
        <h2>Pending agent applications ({pendingAgents.length})</h2>
        <AgentsTable rows={pendingAgents} onAction={handleAgentAction} showActions />
      </section>

      {otherAgents.length > 0 && (
        <section>
          <h2>Past agent applications</h2>
          <AgentsTable rows={otherAgents} />
        </section>
      )}

      <style>{adminStyles}</style>
    </div>
  )
}

function RequestsTable({ rows, onAction, showActions }) {
  if (rows.length === 0) return <p className="admin-empty">Nothing here.</p>
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Ref</th><th>Type</th><th>Name</th><th>Airtel</th><th>Package</th><th>Status</th><th>Created</th>
          {showActions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.reference_code}</td>
            <td>{r.type}</td>
            <td>{r.full_name}</td>
            <td>{r.airtel_number}</td>
            <td>{r.package || '—'}</td>
            <td><span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span></td>
            <td>{fmtDate(r.created_at)}</td>
            {showActions && (
              <td className="admin-actions">
                <button className="admin-icon-btn admin-approve" onClick={() => onAction(r.id, 'approve')} aria-label="Approve">
                  <Check size={16} />
                </button>
                <button className="admin-icon-btn admin-reject" onClick={() => onAction(r.id, 'reject')} aria-label="Reject">
                  <X size={16} />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AgentsTable({ rows, onAction, showActions }) {
  if (rows.length === 0) return <p className="admin-empty">Nothing here.</p>
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th><th>Phone</th><th>Email</th><th>District</th><th>Status</th><th>Applied</th>
          {showActions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a.id}>
            <td>{a.full_name}</td>
            <td>{a.phone_number}</td>
            <td>{a.email}</td>
            <td>{a.district || '—'}</td>
            <td><span className={`admin-badge admin-badge-${a.status}`}>{a.status}</span></td>
            <td>{fmtDate(a.created_at)}</td>
            {showActions && (
              <td className="admin-actions">
                <button className="admin-icon-btn admin-approve" onClick={() => onAction(a.id, 'approve')} aria-label="Approve">
                  <Check size={16} />
                </button>
                <button className="admin-icon-btn admin-reject" onClick={() => onAction(a.id, 'reject')} aria-label="Reject">
                  <X size={16} />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const adminStyles = `
  .admin-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ink);
  }
  .admin-gate-card {
    background: var(--indigo);
    border: 1px solid var(--slate-line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 36px;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .admin-gate-card h1 { font-size: 20px; color: var(--paper); }
  .admin-token-field {
    position: relative;
    display: flex;
  }
  .admin-token-field input { flex: 1; padding-right: 40px; }
  .admin-token-toggle {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--slate);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
  }
  .admin-token-toggle:hover { color: var(--paper); background: var(--ink); }
  .admin-gate-card input {
    border: 1px solid var(--slate-line);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    background: var(--ink);
    color: var(--paper);
  }
  .admin-page {
    min-height: 100vh;
    background: var(--ink);
    padding: 40px 32px 80px;
  }
  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  .admin-header h1 { font-size: 22px; color: var(--paper); }
  .admin-header .btn { gap: 6px; }
  .admin-page section { margin-bottom: 40px; }
  .admin-page h2 { font-size: 15px; color: var(--paper); margin-bottom: 14px; }
  .admin-empty { color: var(--slate); font-size: 14px; }
  .admin-error { color: #DC2626; font-size: 13px; }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--indigo);
    border: 1px solid var(--slate-line);
    border-radius: var(--radius);
    overflow: hidden;
    font-size: 13px;
  }
  .admin-table th, .admin-table td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid var(--slate-line);
    color: var(--paper);
    white-space: nowrap;
  }
  .admin-table th {
    color: var(--slate);
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .admin-badge-pending { background: var(--indigo-soft); color: var(--signal); }
  .admin-badge-done, .admin-badge-approved { background: rgba(16, 185, 129, 0.12); color: var(--live); }
  .admin-badge-rejected { background: rgba(220, 38, 38, 0.1); color: #DC2626; }
  .admin-actions { display: flex; gap: 8px; }
  .admin-icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--slate-line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--ink);
  }
  .admin-approve:hover { border-color: var(--live); color: var(--live); }
  .admin-reject:hover { border-color: #DC2626; color: #DC2626; }
`