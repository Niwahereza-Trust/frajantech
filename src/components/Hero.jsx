import SignalBars from './SignalBars.jsx'
import { useConnectModal } from '../context/ConnectModalContext.jsx'

export default function Hero() {
  const { open: openConnect } = useConnectModal()

  return (
    <section id="home" className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">Frajan Tech Unlimited</div>
          <h1>
            Stay online.<br />
            <span className="accent">Stay ahead.</span>
          </h1>
          <p className="hero-lede">
            Simple internet access for eligible Android users, with clear
            pricing and dedicated customer support.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => openConnect('connection')}>
              Get Connected →
            </button>
            <a className="btn btn-ghost" href="#check-status">Check Status</a>
          </div>
          <p className="hero-hint">Chrome menu → Add to Home screen</p>
        </div>

        <div className="hero-panel" aria-hidden="true">
          <div className="panel-row">
            <span>Network</span>
            <SignalBars variant="live" pulse />
          </div>
          <div className="panel-row">
            <span>Status</span>
            <span className="dot-live">Connected</span>
          </div>
          <div className="panel-row">
            <span>Plan</span>
            <span>VIP Package</span>
          </div>
          <div className="panel-foot">Renews automatically when topped up</div>
        </div>
      </div>

      <style>{`
        .hero { padding-top: 96px; padding-bottom: 96px; border-top: none; }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 56px;
          align-items: center;
        }
        .hero-copy h1 {
          font-size: clamp(32px, 4.5vw, 48px);
          color: var(--paper);
        }
        .hero .eyebrow {
          font-size: 18px;
          letter-spacing: 0.06em;
        }
        .accent { color: var(--signal); }
        .hero-lede {
          margin-top: 20px;
          font-size: 17px;
          max-width: 460px;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .hero-hint {
          margin-top: 18px;
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--slate);
        }
        .hero-panel {
          background: var(--indigo);
          border: 1px solid var(--slate-line);
          border-radius: var(--radius);
          padding: 26px;
          box-shadow: var(--shadow);
        }
        .panel-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--slate-line);
          font-family: var(--font-mono);
          font-size: 13px;
        }
        .panel-row:last-of-type { border-bottom: none; }
        .dot-live { color: var(--live); }
        .panel-foot {
          margin-top: 14px;
          font-size: 12px;
          color: var(--slate);
        }
        @media (max-width: 860px) {
          .hero-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}