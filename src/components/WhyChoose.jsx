const POINTS = [
  { title: 'Fast activation', desc: 'Clear joining steps and quick account processing.' },
  { title: 'Affordable renewals', desc: 'Simple monthly pricing without confusing package duplication.' },
  { title: 'Dedicated support', desc: 'Official customer-care channels whenever assistance is needed.' },
]

export default function WhyChoose() {
  return (
    <section id="why">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Why Choose Frajan Tech</div>
          <h2>Simple service. Clear support.</h2>
        </div>

        <div className="why-grid">
          {POINTS.map((p) => (
            <div key={p.title} className="why-card">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .why-card {
          background: var(--indigo);
          border: 1px solid var(--slate-line);
          border-radius: var(--radius);
          padding: 26px;
          box-shadow: var(--shadow);
        }
        .why-card h3 {
          font-size: 17px;
          color: var(--paper);
          margin-bottom: 10px;
        }
        @media (max-width: 860px) {
          .why-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
