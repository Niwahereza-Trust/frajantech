import SignalBars from './SignalBars.jsx'
import { useAgentModal } from '../context/AgentModalContext.jsx'

export default function Footer() {
  const { open: openAgentModal } = useAgentModal()

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <a href="#home" className="nav-brand">
            <SignalBars variant="accent" />
            <span><strong>FRAJAN TECH</strong> UNLIMITED</span>
          </a>
          <p>Stay online. Stay ahead.</p>
        </div>

        <div className="footer-links">
          <a href="mailto:support@frajantechunlimited.com">Customer Care</a>
          <button className="footer-link-btn" onClick={openAgentModal}>Become a Special Agent</button>
          <a href="https://app.frajantechunlimited.com/pilot">Agent Login</a>
          <a href="https://app.frajantechunlimited.com/privacy">Privacy</a>
          <a href="https://app.frajantechunlimited.com/terms">Terms</a>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Frajan Tech Unlimited. All rights reserved.</span>
        <a href="https://api.whatsapp.com/send?phone=256786774925&text=Hello%20Frajan%20Tech%20customer%20care%2C%20I%20need%20help.">
          WhatsApp
        </a>
      </div>

      <style>{`
        .footer {
          border-top: 1px solid var(--slate-line);
          padding: 56px 0 0;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          padding-bottom: 40px;
        }
        .footer-brand p {
          margin-top: 10px;
          font-size: 13px;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 14px;
        }
        .footer-links a:hover { color: var(--signal); }
        .footer-link-btn {
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          font: inherit;
          color: inherit;
        }
        .footer-link-btn:hover { color: var(--signal); }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--slate-line);
          padding: 20px 0;
          font-size: 12px;
          color: var(--slate);
        }
        .footer-bottom a:hover { color: var(--signal); }
        @media (max-width: 600px) {
          .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>
    </footer>
  )
}
