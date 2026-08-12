import { useEffect, useState } from 'react'
import { API_BASE } from '../config.js'

const AUTO_ADVANCE_MS = 5000

export default function Announcements() {
  const [flyers, setFlyers] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/flyers`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setFlyers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setFlyers([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const go = (dir) => {
    if (flyers.length === 0) return
    setIndex((i) => (i + dir + flyers.length) % flyers.length)
  }

  useEffect(() => {
    if (flyers.length <= 1 || paused) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % flyers.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [flyers.length, paused])

  if (loading) return null

  const hasFlyers = flyers.length > 0
  const current = hasFlyers ? flyers[index] : null

  return (
    <div
      className="announce"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="wrap announce-inner">
        <button aria-label="Previous announcement" onClick={() => go(-1)} disabled={!hasFlyers}>‹</button>

        <div className="announce-body">
          {hasFlyers ? (
            <>
              <img
                key={current.id}
                src={current.image_url}
                alt={current.caption || 'Announcement'}
                className="announce-image"
              />
              {current.caption && <p>{current.caption}</p>}
            </>
          ) : (
            <>
              <span className="tag">Official CEO Announcement</span>
              <p>Official company updates and posters will appear here.</p>
            </>
          )}
        </div>

        <button aria-label="Next announcement" onClick={() => go(1)} disabled={!hasFlyers}>›</button>
      </div>

      {hasFlyers && flyers.length > 1 && (
        <div className="announce-dots">
          {flyers.map((f, i) => (
            <button
              key={f.id}
              className={`announce-dot ${i === index ? 'active' : ''}`}
              aria-label={`Go to announcement ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      <style>{`
        .announce {
          background: var(--indigo);
          border-bottom: 1px solid var(--slate-line);
          padding: 16px 0 10px;
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
        .announce button:disabled { opacity: 0.4; cursor: default; }
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
        .announce-body p { font-size: 13px; color: var(--slate); margin-top: 8px; }
        .announce-image {
          max-height: 320px;
          max-width: 90%;
          width: auto;
          border-radius: 10px;
          margin: 0 auto;
          display: block;
          box-shadow: var(--shadow);
          animation: announce-fade 0.4s ease;
        }
        @keyframes announce-fade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .announce-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 10px;
        }
        .announce-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          border-radius: 999px;
          border: none;
          background: var(--slate-line);
        }
        .announce-dot.active { background: var(--signal); width: 18px; }
      `}</style>
    </div>
  )
}