import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { useConnectModal } from '../context/ConnectModalContext.jsx'
import { CONNECT_API_ENDPOINT } from '../config.js'

const TABS = [
  { id: 'connection', label: 'New connection' },
  { id: 'renewal', label: 'Renewal' },
  { id: 'support', label: 'Support' },
]

const PACKAGE_OPTIONS = {
  connection: [{ value: 'First-time Subscription', label: 'First-time Subscription — UGX 35,000' }],
  renewal: [
    { value: 'VIP Package', label: 'VIP Package — UGX 15,000' },
    { value: 'Monthly Package', label: 'Monthly Package — UGX 10,000' },
    { value: 'LFH Package', label: 'LFH Package — UGX 7,000' },
  ],
  support: [],
}

const PAYMENT_INFO = {
  number: '0740273673',
  name: 'Kihembo Francis',
}

const COPY = {
  connection: {
    eyebrow: 'Official Client Service',
    title: 'How can we help?',
    lede: 'Send your request directly to Frajan Tech customer care and keep the reference number for follow-up.',
  },
  renewal: {
    eyebrow: 'Official Client Service',
    title: 'Renew your package.',
    lede: 'Send your renewal request directly to Frajan Tech customer care and keep the reference number for follow-up.',
  },
  support: {
    eyebrow: 'Official Client Service',
    title: 'Need a hand?',
    lede: 'Send your support request directly to Frajan Tech customer care and keep the reference number for follow-up.',
  },
}

const emptyForm = { fullName: '', airtelNumber: '', package: '', note: '' }

export default function ConnectModal() {
  const { isOpen, type, close, setType } = useConnectModal()
  const [form, setForm] = useState(emptyForm)
  const [proofFile, setProofFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | sending | error | limited
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm)
      setProofFile(null)
      setStatus('idle')
      setErrorMessage('')
    }
  }, [isOpen, type])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const packages = PACKAGE_OPTIONS[type]
  const copy = COPY[type]

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!proofFile) {
      setStatus('error')
      setErrorMessage('Please attach a screenshot of your payment before submitting.')
      return
    }

    setStatus('sending')
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('fullName', form.fullName)
      formData.append('airtelNumber', form.airtelNumber)
      formData.append('package', form.package)
      formData.append('note', form.note)
      formData.append('paymentProof', proofFile)

      const res = await fetch(CONNECT_API_ENDPOINT, {
        method: 'POST',
        body: formData,
      })

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        setStatus('limited')
        setErrorMessage(data.error || 'A request from this number was already submitted recently. Please wait before submitting another.')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Request failed')
      }

      // Success — close the modal immediately, no lingering confirmation screen.
      close()
    } catch (err) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again or contact support directly.')
    }
  }

  return (
    <div className="cm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="cm-modal" role="dialog" aria-modal="true" aria-label={copy.title}>
        <button className="cm-close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        <div className="cm-grid">
          <div className="cm-side">
            <div className="eyebrow">{copy.eyebrow}</div>
            <h2>{copy.title}</h2>
            <p>{copy.lede}</p>

            <div className="cm-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`cm-tab ${type === t.id ? 'active' : ''}`}
                  onClick={() => setType(t.id)}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form className="cm-form" onSubmit={handleSubmit}>
            <div className="cm-payment-note">
              <span className="cm-payment-label">Send payment to</span>
              <span className="cm-payment-number">{PAYMENT_INFO.number}</span>
              <span className="cm-payment-name">({PAYMENT_INFO.name})</span>
            </div>

            <div className="cm-row-2">
              <div className="cm-field">
                <label htmlFor="cm-name">Full name</label>
                <input
                  id="cm-name"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                />
              </div>
              <div className="cm-field">
                <label htmlFor="cm-airtel">Airtel number</label>
                <input
                  id="cm-airtel"
                  type="tel"
                  placeholder="07…"
                  required
                  value={form.airtelNumber}
                  onChange={handleChange('airtelNumber')}
                />
              </div>
            </div>

            {packages.length > 0 && (
              <div className="cm-field">
                <label htmlFor="cm-package">Package</label>
                <select
                  id="cm-package"
                  required
                  value={form.package}
                  onChange={handleChange('package')}
                >
                  <option value="" disabled>Choose package</option>
                  {packages.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="cm-field">
              <label htmlFor="cm-note">Additional note (optional)</label>
              <textarea
                id="cm-note"
                rows={4}
                value={form.note}
                onChange={handleChange('note')}
              />
            </div>

            <div className="cm-field">
              <label htmlFor="cm-proof">Proof of payment (screenshot) — required</label>
              <input
                id="cm-proof"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setProofFile(e.target.files[0] || null)}
              />
              {proofFile && <span className="cm-file-name">{proofFile.name}</span>}
            </div>

            <button className="btn btn-primary cm-submit" type="submit" disabled={status === 'sending' || !proofFile}>
              {status === 'sending' ? 'Sending…' : 'Submit request'} <ArrowRight size={16} />
            </button>

            {status === 'limited' && <p className="cm-status cm-status-err">{errorMessage}</p>}
            {status === 'error' && <p className="cm-status cm-status-err">{errorMessage}</p>}
          </form>
        </div>
      </div>

      <style>{`
        .cm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }
        .cm-modal {
          position: relative;
          background: var(--indigo);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          max-width: 880px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .cm-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          color: var(--slate);
          z-index: 2;
        }
        .cm-close:hover { color: var(--paper); }
        .cm-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
        }
        .cm-side {
          padding: 40px 36px;
          border-right: 1px solid var(--slate-line);
        }
        .cm-side h2 {
          font-size: clamp(28px, 4vw, 36px);
          color: var(--paper);
          margin: 6px 0 14px;
        }
        .cm-side p { max-width: 320px; }
        .cm-tabs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 28px;
        }
        .cm-tab {
          text-align: left;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid var(--slate-line);
          background: var(--indigo);
          color: var(--paper);
          font-weight: 600;
          font-size: 14px;
        }
        .cm-tab.active {
          background: var(--paper);
          color: var(--indigo);
          border-color: var(--paper);
        }
        .cm-form {
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cm-payment-note {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px;
          background: var(--indigo-soft);
          border: 1px solid var(--signal);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
        }
        .cm-payment-label { color: var(--slate); }
        .cm-payment-number {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 15px;
          color: var(--signal);
        }
        .cm-payment-name { color: var(--paper); font-weight: 600; }
        .cm-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .cm-field { display: flex; flex-direction: column; gap: 8px; }
        .cm-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
        }
        .cm-field input,
        .cm-field select,
        .cm-field textarea {
          border: 1px solid var(--slate-line);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          background: var(--ink);
          color: var(--paper);
        }
        .cm-field textarea { resize: vertical; }
        .cm-field input:focus,
        .cm-field select:focus,
        .cm-field textarea:focus {
          outline: none;
          border-color: var(--signal);
        }
        .cm-submit {
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }
        .cm-submit:disabled { opacity: 0.7; cursor: default; }
        .cm-status { font-size: 13px; }
        .cm-status-ok { color: var(--live); }
        .cm-status-err { color: #DC2626; }
        .cm-file-name { font-size: 12px; color: var(--slate); }

        @media (max-width: 720px) {
          .cm-grid { grid-template-columns: 1fr; }
          .cm-side { border-right: none; border-bottom: 1px solid var(--slate-line); }
          .cm-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}