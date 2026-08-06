import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { useAgentModal } from '../context/AgentModalContext.jsx'
import { AGENT_API_ENDPOINT } from '../config.js'

const emptyForm = { fullName: '', phoneNumber: '', email: '', district: '' }

export default function AgentModal() {
  const { isOpen, close } = useAgentModal()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm)
      setStatus('idle')
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(AGENT_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="am-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="am-modal" role="dialog" aria-modal="true" aria-label="Agent application">
        <button className="am-close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        <div className="am-grid">
          <div className="am-side">
            <span className="am-brand"><strong>FRAJAN TECH</strong> UNLIMITED</span>

            <div className="am-eyebrow">Special Agents Program</div>
            <h2>Build referrals.<br />Earn every month.</h2>
            <p>
              Slots are available. Approved agents earn UGX
              15,000 per 5 verified connection and UGX 2,000 for every
              active referral.
            </p>

            <div className="am-stats">
              <div>
                <strong>4</strong>
                <span>monthly target</span>
              </div>
              <div>
                <strong>Slots are still avialable</strong>
                <span>total positions</span>
              </div>
            </div>
          </div>

          <form className="am-form" onSubmit={handleSubmit}>
            <button type="button" className="am-back" onClick={close}>← Back to website</button>

            <div className="am-eyebrow am-eyebrow-form">Agent Application</div>
            <h2>Tell us about yourself</h2>
            <p className="am-form-lede">Your application will remain pending until reviewed by Frajan Tech.</p>

            <div className="am-row-2">
              <div className="am-field">
                <label htmlFor="am-name">Full name</label>
                <input
                  id="am-name"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                />
              </div>
              <div className="am-field">
                <label htmlFor="am-phone">Phone number</label>
                <input
                  id="am-phone"
                  type="tel"
                  placeholder="07…"
                  required
                  value={form.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                />
              </div>
            </div>

            <div className="am-row-2">
              <div className="am-field">
                <label htmlFor="am-email">Email address</label>
                <input
                  id="am-email"
                  type="email"
                  placeholder="Used for secure agent access"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                />
              </div>
              <div className="am-field">
                <label htmlFor="am-district">District</label>
                <input
                  id="am-district"
                  type="text"
                  value={form.district}
                  onChange={handleChange('district')}
                />
              </div>
            </div>

            <button className="btn btn-primary am-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Submitting…' : 'Submit application'} <ArrowRight size={16} />
            </button>

            {status === 'sent' && <p className="am-status am-status-ok">Application received — we'll follow up shortly.</p>}
            {status === 'error' && <p className="am-status am-status-err">Something went wrong. Please try again or contact support directly.</p>}
          </form>
        </div>
      </div>

      <style>{`
        .am-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }
        .am-modal {
          position: relative;
          background: var(--indigo);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          max-width: 920px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .am-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          z-index: 2;
        }
        .am-close:hover { color: #fff; }
        .am-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
        }
        .am-side {
          background: var(--paper);
          color: var(--ink);
          padding: 44px 40px;
        }
        .am-brand {
          display: block;
          font-family: var(--font-display);
          font-size: 13px;
          letter-spacing: 0.02em;
          margin-bottom: 40px;
        }
        .am-brand strong { color: var(--live); }
        .am-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #F87171;
          margin-bottom: 14px;
        }
        .am-side h2 {
          font-size: clamp(28px, 4vw, 38px);
          color: #fff;
          margin-bottom: 18px;
        }
        .am-side p {
          color: rgba(255, 255, 255, 0.7);
          max-width: 380px;
          margin-bottom: 32px;
        }
        .am-stats {
          display: flex;
          gap: 40px;
        }
        .am-stats div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .am-stats strong {
          font-family: var(--font-mono);
          font-size: 26px;
          color: #fff;
        }
        .am-stats span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        .am-form {
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .am-back {
          align-self: flex-start;
          background: none;
          border: none;
          color: #DC2626;
          font-size: 13px;
          font-weight: 600;
          padding: 0;
          margin-bottom: 8px;
        }
        .am-eyebrow-form { margin-bottom: 6px; color: #DC2626; }
        .am-form h2 {
          font-size: clamp(24px, 3vw, 30px);
          color: var(--paper);
          margin-bottom: 8px;
        }
        .am-form-lede { margin-bottom: 4px; }
        .am-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .am-field { display: flex; flex-direction: column; gap: 8px; }
        .am-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
        }
        .am-field input {
          border: 1px solid var(--slate-line);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          background: var(--ink);
          color: var(--paper);
        }
        .am-field input:focus {
          outline: none;
          border-color: var(--signal);
        }
        .am-submit {
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }
        .am-submit:disabled { opacity: 0.7; cursor: default; }
        .am-status { font-size: 13px; }
        .am-status-ok { color: var(--live); }
        .am-status-err { color: #DC2626; }

        @media (max-width: 760px) {
          .am-grid { grid-template-columns: 1fr; }
          .am-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}