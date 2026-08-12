import { useEffect, useState } from 'react'
import { API_BASE } from '../config.js'

export default function Announcements() {
  const [flyers, setFlyers] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

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

  if (loading) return null

  const hasFlyers = flyers.length > 0
  const current = hasFlyers ? flyers[index] : null

  return (
    <div className="announce">
      <div className="wrap announce-inner">
        <button aria-label="Previous announcement" onClick={() => go(-1)} disabled={!hasFlyers}>‹</button>

        <div className="announce-body">
          {hasFlyers ? (
            <>
              <img src={current.image_url} alt={current.caption || 'Announcement'} className="announce-image" />
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
        .announce-body p { font-size: 13px; color: var(--slate); }
        .announce-image {
          max-height: 160px;
          max-width: 100%;
          border-radius: 8px;
          margin: 0 auto 8px;
          display: block;
        }
      `}</style>
    </div>
  )
}