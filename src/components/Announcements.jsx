import { useState } from 'react'

const SLIDES = [
  'Official company updates and posters will appear here.',
]

export default function Announcements() {
  const [index, setIndex] = useState(0)

  const go = (dir) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length)
  }

  return (
    <div className="announce">
      <div className="wrap announce-inner">
        <button aria-label="Previous announcement" onClick={() => go(-1)}>‹</button>
        <div className="announce-body">
          <span className="tag">Official CEO Announcement</span>
          <p>{SLIDES[index]}</p>
        </div>
        <button aria-label="Next announcement" onClick={() => go(1)}>›</button>
      </div>

      <style>{`
        .announce {
          background: var(--indigo);
          border-bottom: 1px solid var(--slate-line);
          padding: 10px 0;
        }
        .announce-inner {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .announce button {
          background: none;
          border: 1px solid var(--slate-line);
          color: var(--paper);
          border-radius: 6px;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .announce button:hover { border-color: var(--signal); color: var(--signal); }
        .announce-body { flex: 1; text-align: center; }
        .tag {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--signal);
          margin-bottom: 4px;
        }
        .announce-body p { font-size: 13px; color: var(--slate); }
      `}</style>
    </div>
  )
}
