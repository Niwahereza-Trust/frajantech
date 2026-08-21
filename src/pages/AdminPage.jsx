import { useEffect, useState, useCallback } from 'react'
import { Check, X, RefreshCw, Eye, EyeOff, Pencil, Trash2, Upload } from 'lucide-react'
import { API_BASE } from '../config.js'
import AdminSidebar from '../components/Sidebar.jsx'

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

// Flyer uploads use multipart/form-data — do NOT set Content-Type manually,
// the browser needs to add its own multipart boundary.
async function apiUpload(path, { formData, token }) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'x-admin-token': token },
    body: formData,
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
  const [flyers, setFlyers] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Request selection + inline edit
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ type: '', fullName: '', airtelNumber: '', package: '' })

  // Client inline edit
  const [editingClientId, setEditingClientId] = useState(null)
  const [clientEditForm, setClientEditForm] = useState({ full_name: '', airtel_number: '', package: '', status: 'active' })

  // Flyer upload form
  const [flyerFile, setFlyerFile] = useState(null)
  const [flyerCaption, setFlyerCaption] = useState('')
  const [flyerUploading, setFlyerUploading] = useState(false)

  const load = useCallback(async (t) => {
    setLoading(true)
    setError('')
    try {
      const [reqData, agentData, flyerData, clientData] = await Promise.all([
        apiFetch('/api/requests', { token: t }),
        apiFetch('/api/agents', { token: t }),
        apiFetch('/api/flyers/all', { token: t }),
        apiFetch('/api/clients', { token: t }),
      ])
      setRequests(reqData)
      setAgents(agentData)
      setFlyers(flyerData)
      setClients(clientData)
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

  // ---- Request selection / bulk delete ----
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (ids) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} request(s)? This cannot be undone.`)) return
    try {
      await apiFetch('/api/requests/bulk-delete', {
        method: 'POST',
        token,
        body: { ids: Array.from(selectedIds) },
      })
      setSelectedIds(new Set())
      load(token)
    } catch {
      setError('Bulk delete failed. Please try again.')
    }
  }

  const handleDeleteOne = async (id) => {
    if (!confirm('Delete this request? This cannot be undone.')) return
    try {
      await apiFetch(`/api/requests/${id}`, { method: 'DELETE', token })
      load(token)
    } catch {
      setError('Delete failed. Please try again.')
    }
  }

  // ---- Request edit ----
  const startEdit = (row) => {
    setEditingId(row.id)
    setEditForm({
      type: row.type || '',
      fullName: row.full_name || '',
      airtelNumber: row.airtel_number || '',
      package: row.package || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id) => {
    try {
      await apiFetch(`/api/requests/${id}`, { method: 'PATCH', token, body: editForm })
      setEditingId(null)
      load(token)
    } catch {
      setError('Save failed. Please try again.')
    }
  }

  // ---- Flyers ----
  const handleFlyerUpload = async (e) => {
    e.preventDefault()
    if (!flyerFile) return
    setFlyerUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', flyerFile)
      formData.append('caption', flyerCaption)
      await apiUpload('/api/flyers', { formData, token })
      setFlyerFile(null)
      setFlyerCaption('')
      e.target.reset()
      load(token)
    } catch {
      setError('Flyer upload failed. Please try again.')
    } finally {
      setFlyerUploading(false)
    }
  }

  const handleFlyerDelete = async (id) => {
    if (!confirm('Delete this flyer?')) return
    try {
      await apiFetch(`/api/flyers/${id}`, { method: 'DELETE', token })
      load(token)
    } catch {
      setError('Delete failed. Please try again.')
    }
  }

  const handleFlyerToggle = async (f) => {
    try {
      await apiFetch(`/api/flyers/${f.id}`, { method: 'PATCH', token, body: { published: !f.published } })
      load(token)
    } catch {
      setError('That action failed. Please try again.')
    }
  }

  // ---- Clients ----
  const startClientEdit = (row) => {
    setEditingClientId(row.id)
    setClientEditForm({
      full_name: row.full_name || '',
      airtel_number: row.airtel_number || '',
      package: row.package || '',
      status: row.status || 'active',
    })
  }

  const cancelClientEdit = () => {
    setEditingClientId(null)
  }

  const saveClientEdit = async (id) => {
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'PATCH', token, body: clientEditForm })
      setEditingClientId(null)
      load(token)
    } catch {
      setError('Save failed. Please try again.')
    }
  }

  const handleClientDelete = async (id) => {
    if (!confirm('Delete this client? This cannot be undone.')) return
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE', token })
      load(token)
    } catch {
      setError('Delete failed. Please try again.')
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
    <>
      <AdminSidebar />
      <div className="admin-page admin-page-with-sidebar">
        <header className="admin-header">
          <h1>Frajan Tech — Admin</h1>
          <button className="btn btn-ghost" onClick={() => load(token)} disabled={loading}>
            <RefreshCw size={15} /> {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>

        {error && <p className="admin-error">{error}</p>}

        <section id="flyers">
          <h2>Flyers</h2>
          <form className="flyer-upload" onSubmit={handleFlyerUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFlyerFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={flyerCaption}
              onChange={(e) => setFlyerCaption(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={!flyerFile || flyerUploading}>
              <Upload size={15} /> {flyerUploading ? 'Uploading…' : 'Upload flyer'}
            </button>
          </form>

          {flyers.length === 0 ? (
            <p className="admin-empty">No flyers yet.</p>
          ) : (
            <div className="flyer-grid">
              {flyers.map((f) => (
                <div className="flyer-card" key={f.id}>
                  <img src={f.image_url} alt={f.caption || 'Flyer'} />
                  {f.caption && <p>{f.caption}</p>}
                  <span className={`admin-badge ${f.published ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                    {f.published ? 'Published' : 'Unpublished'}
                  </span>
                  <div className="flyer-card-actions">
                    <button
                      className="admin-icon-btn"
                      onClick={() => handleFlyerToggle(f)}
                      aria-label={f.published ? 'Unpublish flyer' : 'Publish flyer'}
                    >
                      {f.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button className="admin-icon-btn admin-reject" onClick={() => handleFlyerDelete(f.id)} aria-label="Delete flyer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="requests">
          <h2>Pending requests ({pendingRequests.length})</h2>
          <RequestsTable
            rows={pendingRequests}
            onAction={handleRequestAction}
            showActions
            selectedIds={selectedIds}
            onToggleOne={toggleSelectOne}
            onToggleAll={toggleSelectAll}
            onDeleteOne={handleDeleteOne}
            onBulkDelete={handleBulkDelete}
            editingId={editingId}
            editForm={editForm}
            setEditForm={setEditForm}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
          />
        </section>

        {otherRequests.length > 0 && (
          <section>
            <h2>Past requests</h2>
            <RequestsTable
              rows={otherRequests}
              selectedIds={selectedIds}
              onToggleOne={toggleSelectOne}
              onToggleAll={toggleSelectAll}
              onDeleteOne={handleDeleteOne}
              onBulkDelete={handleBulkDelete}
              editingId={editingId}
              editForm={editForm}
              setEditForm={setEditForm}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
            />
          </section>
        )}

        <section id="clients">
          <h2>Clients ({clients.length})</h2>
          <ClientsTable
            rows={clients}
            editingId={editingClientId}
            editForm={clientEditForm}
            setEditForm={setClientEditForm}
            onStartEdit={startClientEdit}
            onCancelEdit={cancelClientEdit}
            onSaveEdit={saveClientEdit}
            onDelete={handleClientDelete}
          />
        </section>

        <section id="agents">
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
    </>
  )
}

function RequestsTable({
  rows, onAction, showActions,
  selectedIds, onToggleOne, onToggleAll, onDeleteOne, onBulkDelete,
  editingId, editForm, setEditForm, onStartEdit, onCancelEdit, onSaveEdit,
}) {
  if (rows.length === 0) return <p className="admin-empty">Nothing here.</p>

  const ids = rows.map((r) => r.id)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
  const anySelectedHere = ids.some((id) => selectedIds.has(id))

  return (
    <>
      {anySelectedHere && (
        <div className="admin-bulk-bar">
          <span>{ids.filter((id) => selectedIds.has(id)).length} selected</span>
          <button className="btn btn-ghost admin-bulk-delete" onClick={onBulkDelete}>
            <Trash2 size={14} /> Delete selected
          </button>
        </div>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(ids)} aria-label="Select all" />
              </th>
              <th>Ref</th><th>Type</th><th>Name</th><th>Airtel</th><th>Package</th><th>Status</th><th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              editingId === r.id ? (
                <tr key={r.id} className="admin-editing-row">
                  <td></td>
                  <td>{r.reference_code}</td>
                  <td>
                    <input value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))} />
                  </td>
                  <td>
                    <input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
                  </td>
                  <td>
                    <input value={editForm.airtelNumber} onChange={(e) => setEditForm((f) => ({ ...f, airtelNumber: e.target.value }))} />
                  </td>
                  <td>
                    <input value={editForm.package} onChange={(e) => setEditForm((f) => ({ ...f, package: e.target.value }))} />
                  </td>
                  <td><span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span></td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td className="admin-actions">
                    <button className="admin-icon-btn admin-approve" onClick={() => onSaveEdit(r.id)} aria-label="Save">
                      <Check size={16} />
                    </button>
                    <button className="admin-icon-btn admin-reject" onClick={onCancelEdit} aria-label="Cancel">
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => onToggleOne(r.id)}
                      aria-label={`Select ${r.full_name}`}
                    />
                  </td>
                  <td>{r.reference_code}</td>
                  <td>{r.type}</td>
                  <td>{r.full_name}</td>
                  <td>{r.airtel_number}</td>
                  <td>{r.package || '—'}</td>
                  <td><span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span></td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td className="admin-actions">
                    {showActions && (
                      <>
                        <button className="admin-icon-btn admin-approve" onClick={() => onAction(r.id, 'approve')} aria-label="Approve">
                          <Check size={16} />
                        </button>
                        <button className="admin-icon-btn admin-reject" onClick={() => onAction(r.id, 'reject')} aria-label="Reject">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button className="admin-icon-btn" onClick={() => onStartEdit(r)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="admin-icon-btn admin-reject" onClick={() => onDeleteOne(r.id)} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ClientsTable({ rows, editingId, editForm, setEditForm, onStartEdit, onCancelEdit, onSaveEdit, onDelete }) {
  if (rows.length === 0) return <p className="admin-empty">No clients yet.</p>
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Client Ref</th><th>Name</th><th>Airtel</th><th>Package</th><th>Status</th><th>Registered</th><th>Expires</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            editingId === c.id ? (
              <tr key={c.id} className="admin-editing-row">
                <td>{c.client_ref}</td>
                <td>
                  <input value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
                </td>
                <td>
                  <input value={editForm.airtel_number} onChange={(e) => setEditForm((f) => ({ ...f, airtel_number: e.target.value }))} />
                </td>
                <td>
                  <input value={editForm.package} onChange={(e) => setEditForm((f) => ({ ...f, package: e.target.value }))} />
                </td>
                <td>
                  <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="expired">expired</option>
                  </select>
                </td>
                <td>{fmtDate(c.registered_at)}</td>
                <td>{fmtDate(c.expires_at)}</td>
                <td className="admin-actions">
                  <button className="admin-icon-btn admin-approve" onClick={() => onSaveEdit(c.id)} aria-label="Save">
                    <Check size={16} />
                  </button>
                  <button className="admin-icon-btn admin-reject" onClick={onCancelEdit} aria-label="Cancel">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={c.id}>
                <td>{c.client_ref}</td>
                <td>{c.full_name}</td>
                <td>{c.airtel_number}</td>
                <td>{c.package || '—'}</td>
                <td><span className={`admin-badge admin-badge-${c.status}`}>{c.status}</span></td>
                <td>{fmtDate(c.registered_at)}</td>
                <td>{fmtDate(c.expires_at)}</td>
                <td className="admin-actions">
                  <button className="admin-icon-btn" onClick={() => onStartEdit(c)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="admin-icon-btn admin-reject" onClick={() => onDelete(c.id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgentsTable({ rows, onAction, showActions }) {
  if (rows.length === 0) return <p className="admin-empty">Nothing here.</p>
  return (
    <div className="admin-table-wrap">
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
    </div>
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
  .admin-page-with-sidebar {
    margin-left: var(--sidebar-w);
    transition: margin-left 0.18s ease;
  }
  @media (max-width: 960px) {
    .admin-page-with-sidebar { margin-left: 0; }
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
  .admin-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
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
  .admin-table input[type="text"], .admin-table input:not([type="checkbox"]), .admin-table select {
    background: var(--ink);
    border: 1px solid var(--slate-line);
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 13px;
    color: var(--paper);
    width: 100%;
  }
  .admin-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .admin-badge-pending { background: var(--indigo-soft); color: var(--signal); }
  .admin-badge-done, .admin-badge-approved, .admin-badge-active { background: rgba(16, 185, 129, 0.12); color: var(--live); }
  .admin-badge-rejected, .admin-badge-suspended, .admin-badge-expired { background: rgba(220, 38, 38, 0.1); color: #DC2626; }
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
  .admin-bulk-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--paper);
  }
  .admin-bulk-delete { gap: 6px; border-color: #DC2626; color: #DC2626; }
  .flyer-upload {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .flyer-upload input[type="text"] {
    flex: 1;
    min-width: 180px;
    background: var(--indigo);
    border: 1px solid var(--slate-line);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--paper);
  }
  .flyer-upload .btn { gap: 6px; }
  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .flyer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  .flyer-card {
    position: relative;
    background: var(--indigo);
    border: 1px solid var(--slate-line);
    border-radius: var(--radius);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .flyer-card img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }
  .flyer-card p { font-size: 12px; color: var(--slate); margin: 0; }
  .flyer-card-actions {
    display: flex;
    gap: 8px;
    align-self: flex-end;
  }
`