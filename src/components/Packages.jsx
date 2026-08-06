import { useConnectModal } from '../context/ConnectModalContext.jsx'

const PLANS = [
  {
    tag: 'New Customer',
    name: 'First-time Subscription',
    price: 'UGX 35,000',
    desc: 'Includes one full month of connection for a new customer.',
    cta: 'Join Now →',
    connectType: 'connection',
    featured: true,
  },
  {
    tag: 'Monthly Renewal',
    name: 'VIP Package',
    price: 'UGX 15,000',
    desc: 'Monthly renewal for an existing VIP client.',
    cta: 'Renew Now →',
    connectType: 'renewal',
  },
  {
    tag: 'Monthly Renewal',
    name: 'Monthly Package',
    price: 'UGX 10,000',
    desc: 'Monthly renewal for an existing Normal client.',
    cta: 'Renew Now →',
    connectType: 'renewal',
  },

   {
    tag: 'Monthly Renewal',
    name: 'LFH Package',
    price: 'UGX 7,000',
    desc: 'Monthly renewal for an existing Normal client.',
    cta: 'Renew Now →',
    connectType: 'renewal',
  },
]

export default function Packages() {
  const { open: openConnect } = useConnectModal()

  return (
    <section id="packages">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Clear Subscription Pricing</div>
          <h2>Choose the right option.</h2>
          <p>
            First-time subscription is for new customers. Monthly renewal
            packages are for existing connected clients.
          </p>
        </div>

        <div className="plan-grid">
          {PLANS.map((p) => (
            <div key={p.name} className={`plan-card ${p.featured ? 'featured' : ''}`}>
              <span className="plan-tag">{p.tag}</span>
              <h3>{p.name}</h3>
              <div className="plan-price">{p.price}</div>
              <p>{p.desc}</p>
              <button
                className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => openConnect(p.connectType)}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .plan-card {
          background: var(--indigo);
          border: 1px solid var(--slate-line);
          border-radius: var(--radius);
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: var(--shadow);
        }
        .plan-card.featured {
          border-color: var(--signal);
          background: linear-gradient(180deg, var(--indigo-soft), var(--indigo));
        }
        .plan-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--signal);
        }
        .plan-card h3 {
          font-size: 20px;
          color: var(--paper);
          margin-top: 6px;
        }
        .plan-price {
          font-family: var(--font-mono);
          font-size: 30px;
          color: var(--paper);
          margin: 10px 0 4px;
        }
        .plan-card p { margin-bottom: 20px; }
        .plan-card .btn { margin-top: auto; justify-content: center; }
        @media (max-width: 860px) {
          .plan-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
