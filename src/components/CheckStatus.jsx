import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import SignalBars from './SignalBars.jsx'
import { STATUS_API_ENDPOINT } from '../config.js'

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
}

export default function CheckStatus() {
  const [value, setValue] = useState('')
  const [state, setState] = useState('idle') // idle | loading | found | not_found | error
  const [result, setResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const query = value.trim()
    if (!query) return

    setState('loading')
    setResult(null)

    try {
      const res = await fetch(`${STATUS_API_ENDPOINT}?query=${encodeURIComponent(query)}`)
      if (res.status === 404) {
        setState('not_found')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setResult(data)
      setState('found')
      setModalOpen(true)
    } catch (err) {
      setState('error')
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setModalOpen(false) }
    if (modalOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen])

  return (
    <section id="check-status">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Client Self-Service</div>
          <h2>Check your subscription status.</h2>
          <p>
            Use your Client ID or registered Airtel number.
          </p>
        </div>

        <form className="status-card" onSubmit={handleSubmit}>
          <label htmlFor="clientId">Client ID or Airtel number</label>
          <div className="status-row">
            <input
              id="clientId"
              type="text"
              placeholder="e.g. FT-2049 or 07XXXXXXXX"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={state === 'loading'}>
              {state === 'loading' ? 'Checking…' : 'Check status'}
            </button>
          </div>
          <p className="status-note">
            Airtel numbers and payment history remain hidden.
          </p>

          <div className="status-result">
            <div className="result-head">
              <SignalBars variant={state === 'found' ? 'live' : ''} />
              <span>Instant account check</span>
            </div>
            <p>
              {state === 'idle' && 'Your latest subscription information appears here.'}
              {state === 'loading' && 'Checking your account…'}
              {state === 'found' && result && (
                <button type="button" className="status-reopen" onClick={() => setModalOpen(true)}>
                  View details for {result.full_name}
                </button>
              )}
              {state === 'not_found' && 'No matching account found. Double-check your Client ID or Airtel number.'}
              {state === 'error' && 'Something went wrong. Please try again shortly.'}
            </p>
          </div>
        </form>
      </div>

      {modalOpen && result && (
        <div className="sc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="sc-modal" role="dialog" aria-modal="true" aria-label="Subscription details">
            <button className="sc-close" onClick={() => setModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div className="sc-head">
              <SignalBars variant="live" pulse />
              <span>Subscription details</span>
            </div>

            <h3>{result.full_name}</h3>
            <span className={`sc-badge sc-badge-${result.status}`}>{result.status}</span>

            <dl className="sc-rows">
              <div>
                <dt>Client ID</dt>
                <dd>{result.client_ref}</dd>
              </div>
              <div>
                <dt>Package</dt>
                <dd>{result.package}</dd>
              </div>
              <div>
                <dt>Connected on</dt>
                <dd>{fmtDate(result.registered_at)}</dd>
              </div>
              <div>
                <dt>Expires on (30 days)</dt>
                <dd>{fmtDate(result.expires_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <style>{`
        .status-card {
          background: var(--indigo);
          border: 1px solid var(--slate-line);
          border-radius: var(--radius);
          padding: 32px;
          max-width: 640px;
          box-shadow: var(--shadow);
        }
        .status-card label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .status-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .status-row input {
          flex: 1;
          min-width: 200px;
          background: var(--ink);
          border: 1px solid var(--slate-line);
          border-radius: 10px;
          padding: 14px 16px;
          color: var(--paper);
          font-size: 15px;
        }
        .status-row input:focus { border-color: var(--signal); outline: none; }
        .status-note {
          margin-top: 14px;
          font-size: 12px;
        }
        .status-result {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px dashed var(--slate-line);
        }
        .result-head {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
          margin-bottom: 8px;
        }
        .status-reopen {
          background: none;
          border: none;
          padding: 0;
          color: var(--signal);
          font-weight: 600;
          font-size: 14px;
        }
        .status-reopen:hover { text-decoration: underline; }

        .sc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }
        .sc-modal {
          position: relative;
          background: var(--indigo);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          max-width: 420px;
          width: 100%;
          padding: 32px;
        }
        .sc-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--slate);
        }
        .sc-close:hover { color: var(--paper); }
        .sc-head {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--slate);
          margin-bottom: 16px;
        }
        .sc-modal h3 {
          font-size: 22px;
          color: var(--paper);
          margin-bottom: 10px;
        }
        .sc-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .sc-badge-active { background: rgba(16, 185, 129, 0.12); color: var(--live); }
        .sc-badge-expired { background: rgba(220, 38,38, 0.1); color: #DC2626; }
        .sc-badge-pending { background: var(--indigo-soft); color: var(--signal); }
        .sc-rows {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sc-rows > div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--slate-line);
        }
        .sc-rows > div:last-child { border-bottom: none; padding-bottom: 0; }
        .sc-rows dt { font-size: 13px; color: var(--slate); }
        .sc-rows dd { margin: 0; font-size: 13px; font-weight: 600; color: var(--paper); text-align: right;}
      `}</style>
    </section>
  )
}