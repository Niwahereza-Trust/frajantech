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
  const [flyers, setFlyers] = useState([])
  const [flyerFile, setFlyerFile] = useState(null)
  const [flyerCaption, setFlyerCaption] = useState('')
  const [uploadingFlyer, setUploadingFlyer] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null) // { rows, skippedLines }
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null) // { inserted, failed }

  const load = useCallback(async (t) => {
    setLoading(true)
    setError('')
    try {
      const [reqData, agentData, flyerData] = await Promise.all([
        apiFetch('/api/requests', { token: t }),
        apiFetch('/api/agents', { token: t }),
        apiFetch('/api/flyers/all', { token: t }),
      ])
      setRequests(reqData)
      setAgents(agentData)
      setFlyers(flyerData)
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

  const handleFlyerUpload = async (e) => {
    e.preventDefault()
    if (!flyerFile) return
    setUploadingFlyer(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', flyerFile)
      formData.append('caption', flyerCaption)

      const res = await fetch(`${API_BASE}/api/flyers`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: formData,
      })
      if (res.status === 401) throw new Error('unauthorized')
      if (!res.ok) throw new Error('upload-failed')

      setFlyerFile(null)
      setFlyerCaption('')
      load(token)
    } catch {
      setError('Flyer upload failed. Please try again.')
    } finally {
      setUploadingFlyer(false)
    }
  }

  const handleFlyerToggle = async (id, published) => {
    try {
      await apiFetch(`/api/flyers/${id}`, { method: 'PATCH', token, body: { published: !published } })
      load(token)
    } catch {
      setError('That action failed. Please try again.')
    }
  }

  const handleFlyerDelete = async (id) => {
    try {
      await apiFetch(`/api/flyers/${id}`, { method: 'DELETE', token })
      load(token)
    } catch {
      setError('Delete failed. Please try again.')
    }
  }

  const handlePreviewImport = async (e) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setError('')
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('pdf', importFile)

      const res = await fetch(`${API_BASE}/api/clients/import/preview`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: formData,
      })
      if (res.status === 401) throw new Error('unauthorized')
      if (!res.ok) throw new Error('preview-failed')

      const data = await res.json()
      setImportPreview(data)
    } catch {
      setError('Could not read that PDF. Please check the file and try again.')
    } finally {
      setImporting(false)
    }
  }

  const updatePreviewRow = (index, field, value) => {
    setImportPreview((prev) => {
      const rows = [...prev.rows]
      rows[index] = { ...rows[index], [field]: value }
      return { ...prev, rows }
    })
  }

  const removePreviewRow = (index) => {
    setImportPreview((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }))
  }

  const handleConfirmImport = async () => {
    if (!importPreview?.rows?.length) return
    setImporting(true)
    setError('')
    try {
      const result = await apiFetch('/api/clients/import/confirm', {
        method: 'POST',
        token,
        body: { rows: importPreview.rows },
      })
      setImportResult(result)
      setImportPreview(null)
      setImportFile(null)
    } catch {
      setError('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const cancelImport = () => {
    setImportPreview(null)
    setImportFile(null)
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

      <section>
        <h2>Flyers</h2>
        <form onSubmit={handleFlyerUpload} className="flyer-upload-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFlyerFile(e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={flyerCaption}
            onChange={(e) => setFlyerCaption(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={!flyerFile || uploadingFlyer}>
            {uploadingFlyer ? 'Uploading…' : 'Upload flyer'}
          </button>
        </form>

        {flyers.length === 0 ? (
          <p className="admin-empty">No flyers yet.</p>
        ) : (
          <div className="flyer-grid">
            {flyers.map((f) => (
              <div key={f.id} className="flyer-card">
                <img src={f.image_url} alt={f.caption || 'Flyer'} />
                <p>{f.caption || '—'}</p>
                <span className={`admin-badge admin-badge-${f.published ? 'approved' : 'pending'}`}>
                  {f.published ? 'Published' : 'Unpublished'}
                </span>
                <div className="admin-actions">
                  <button className="admin-icon-btn" onClick={() => handleFlyerToggle(f.id, f.published)}>
                    {f.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="admin-icon-btn admin-reject" onClick={() => handleFlyerDelete(f.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Import clients from PDF</h2>

        {!importPreview && (
          <form onSubmit={handlePreviewImport} className="import-upload-form">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setImportFile(e.target.files[0])}
            />
            <button className="btn btn-primary" type="submit" disabled={!importFile || importing}>
              {importing ? 'Reading…' : 'Preview import'}
            </button>
          </form>
        )}

        {importResult && (
          <p className="admin-status-ok">
            Imported {importResult.inserted.length} client{importResult.inserted.length === 1 ? '' : 's'}.
            {importResult.failed.length > 0 && ` ${importResult.failed.length} row(s) failed.`}
          </p>
        )}

        {importPreview && (
          <div className="import-preview">
            <p className="admin-empty">
              {importPreview.rows.length} row{importPreview.rows.length === 1 ? '' : 's'} found.
              Review before confirming — you can edit or remove any row.
            </p>

            {importPreview.skippedLines?.length > 0 && (
              <p className="admin-error">
                {importPreview.skippedLines.length} line(s) in the PDF couldn't be parsed and were skipped.
              </p>
            )}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Airtel</th><th>Package</th><th>Status</th><th>Registered</th><th></th>
                </tr>
              </thead>
              <tbody>
                {importPreview.rows.map((row, i) => (
                  <tr key={i} className={row.valid ? '' : 'import-row-invalid'}>
                    <td>
                      <input
                        className="import-cell-input"
                        value={row.full_name}
                        onChange={(e) => updatePreviewRow(i, 'full_name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="import-cell-input"
                        value={row.airtel_number}
                        onChange={(e) => updatePreviewRow(i, 'airtel_number', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="import-cell-input"
                        value={row.package}
                        onChange={(e) => updatePreviewRow(i, 'package', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="import-cell-input"
                        value={row.status}
                        onChange={(e) => updatePreviewRow(i, 'status', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="import-cell-input"
                        value={row.registered_at || ''}
                        onChange={(e) => updatePreviewRow(i, 'registered_at', e.target.value)}
                      />
                    </td>
                    <td>
                      <button className="admin-icon-btn admin-reject" onClick={() => removePreviewRow(i)} aria-label="Remove row">
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="import-actions">
              <button className="btn btn-ghost" onClick={cancelImport} disabled={importing}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmImport}
                disabled={importing || importPreview.rows.length === 0}
              >
                {importing ? 'Importing…' : `Confirm import (${importPreview.rows.length})`}
              </button>
            </div>
          </div>
        )}
      </section>

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
  .flyer-upload-form {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .flyer-upload-form input[type="text"] {
    border: 1px solid var(--slate-line);
    border-radius: 8px;
    padding: 8px 12px;
    background: var(--ink);
    color: var(--paper);
    flex: 1;
    min-width: 180px;
  }
  .flyer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  .flyer-card {
    background: var(--indigo);
    border: 1px solid var(--slate-line);
    border-radius: var(--radius);
    padding: 12px;
  }
  .flyer-card img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .flyer-card p { color: var(--paper); font-size: 13px; margin-bottom: 8px; }
  .flyer-card .admin-actions { margin-top: 8px; }
  .flyer-card .admin-icon-btn {
    width: auto;
    padding: 0 10px;
    font-size: 12px;
    color: var(--paper);
  }
  .import-upload-form {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .admin-status-ok { color: var(--live); font-size: 13px; margin-top: 8px; }
  .import-preview { margin-top: 16px; }
  .import-preview .admin-table { margin-top: 12px; }
  .import-row-invalid { background: rgba(220, 38, 38, 0.06); }
  .import-cell-input {
    border: 1px solid var(--slate-line);
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 13px;
    background: var(--ink);
    color: var(--paper);
    width: 100%;
    min-width: 100px;
  }
  .import-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }
`