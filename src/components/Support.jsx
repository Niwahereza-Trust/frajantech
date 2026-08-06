export default function Support() {
  return (
    <section id="support" className="support">
      <div className="wrap support-inner">
        <div className="eyebrow">Customer Care</div>
        <h2>Need help with connection or renewal?</h2>
        <p>Use the official Frajan Tech channels for quick account support.</p>

        <div className="support-actions">
          <a
            className="btn btn-primary"
            href="https://api.whatsapp.com/send?phone=256786774925&text=Hello%20Frajan%20Tech%20customer%20care%2C%20I%20need%20support."
          >
            Chat on WhatsApp →
          </a>
          <a className="btn btn-ghost" href="tel:0200907902">Call 0200-907902</a>
        </div>
      </div>

      <style>{`
        .support { text-align: center; }
        .support-inner {
          max-width: 560px;
          margin: 0 auto;
        }
        .support h2 { margin-top: 4px; font-size: clamp(26px, 4vw, 34px); }
        .support p { margin-top: 14px; }
        .support-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 30px;
          flex-wrap: wrap;
        }
      `}</style>
    </section>
  )
}
