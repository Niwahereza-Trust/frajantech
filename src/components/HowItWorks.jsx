import { useConnectModal } from '../context/ConnectModalContext.jsx'

const STEPS = [
  { n: '01', title: 'Join Now', desc: 'Complete the connection form with your Airtel number and required details.' },
  { n: '02', title: 'Make Payment', desc: 'Use the official Frajan Tech payment details and send your payment screenshot.' },
  { n: '03', title: 'Account Activation', desc: 'Our team verifies the payment and activates your internet connection.' },
  { n: '04', title: 'Stay Connected', desc: 'Check your status anytime and renew before expiry to avoid interruption.' },
]

export default function HowItWorks() {
  const { open: openConnect } = useConnectModal()

  return (
    <section id="how">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">How It Works</div>
          <h2>Four simple steps to get connected.</h2>
        </div>

        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="steps-actions">
          <button className="btn btn-primary" onClick={() => openConnect('connection')}>Join Now →</button>
          <a className="btn btn-ghost" href="#check-status">Check Status</a>
        </div>
      </div>

      <style>{`
        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .step {
          position: relative;
          padding-top: 8px;
        }
        .step-n {
          display: block;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--slate);
          margin-bottom: 14px;
        }
        .step h3 {
          font-size: 17px;
          color: var(--paper);
          margin-bottom: 8px;
        }
        .steps-actions {
          display: flex;
          gap: 14px;
          margin-top: 44px;
          flex-wrap: wrap;
        }
        @media (max-width: 860px) {
          .steps { grid-template-columns: 1fr 1fr; row-gap: 32px; }
        }
        @media (max-width: 520px) {
          .steps { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
