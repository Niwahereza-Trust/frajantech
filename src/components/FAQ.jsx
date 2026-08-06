import { useState } from 'react'

const ITEMS = [
  { q: 'How do I join?', a: 'Tap Join Now, submit your Airtel number and follow the official payment instructions.' },
  { q: 'What does UGX 35,000 include?', a: 'It is the first-time subscription and includes one month of connection.' },
  { q: 'How do monthly renewals work?', a: 'VIP renewal is UGX 15,000, Monthly renewal is UGX 10,000 and LFH renewal is UGX 7,000.' },
  { q: 'Which devices are supported?', a: 'The service is intended for eligible Android devices using an Airtel number.' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Frequently Asked Questions</div>
          <h2>Before you connect.</h2>
        </div>

        <div className="faq-list">
          {ITEMS.map((item, i) => (
            <div className="faq-item" key={item.q}>
              <button
                className="faq-q"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                aria-expanded={openIndex === i}
              >
                <span>{item.q}</span>
                <span aria-hidden="true">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && <p className="faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .faq-list { max-width: 720px; }
        .faq-item {
          border-bottom: 1px solid var(--slate-line);
        }
        .faq-q {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          color: var(--paper);
          padding: 20px 0;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          text-align: left;
        }
        .faq-a {
          padding-bottom: 20px;
          max-width: 560px;
        }
      `}</style>
    </section>
  )
}
