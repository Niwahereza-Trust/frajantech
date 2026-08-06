import { useState } from 'react'

export default function Referral() {
  const [open, setOpen] = useState(false)

  return (
    <section id="reviews">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Real Clients. Real Feedback.</div>
          <h2>Client reviews.</h2>
          <p>Genuine feedback from verified Frajan Tech Unlimited clients.</p>
        </div>

        <div className="reviews-slot">
          <p>Client review widget goes here — wire this up to your reviews source.</p>
        </div>

        <div className={`referral ${open ? 'open' : ''}`}>
          <button className="referral-toggle" onClick={() => setOpen((v) => !v)}>
            <span>Refer a Friend</span>
            <span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>

          {open && (
            <div className="referral-body">
              <h3>Help a friend get connected.</h3>
              <p>
                Share Frajan Tech Unlimited with someone who needs a reliable
                connection. Referral details remain hidden until this section
                is opened.
              </p>
              <a
                className="btn btn-primary"
                href="https://api.whatsapp.com/send?phone=256786774925&text=Hello%20Frajan%20Tech%2C%20I%20would%20like%20information%20about%20referring%20a%20friend."
              >
                Ask About Referrals →
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reviews-slot {
          border: 1px dashed var(--slate-line);
          border-radius: var(--radius);
          padding: 30px;
          margin-bottom: 28px;
        }
        .referral {
          border: 1px solid var(--slate-line);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .referral-toggle {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--indigo);
          border: none;
          color: var(--paper);
          padding: 20px 26px;
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
        }
        .referral-body {
          padding: 0 26px 26px;
        }
        .referral-body h3 {
          font-size: 18px;
          color: var(--paper);
          margin-bottom: 10px;
        }
        .referral-body p { margin-bottom: 20px; }
      `}</style>
    </section>
  )
}
