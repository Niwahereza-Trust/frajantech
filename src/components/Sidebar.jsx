import { useState, useEffect } from 'react'
import { Image, ClipboardList, Users, UserCheck, ChevronLeft, ChevronRight, ExternalLink, Menu, X } from 'lucide-react'

const COLLAPSE_KEY = 'ft_sidebar_collapsed'
const EXPANDED_W = '240px'
const COLLAPSED_W = '76px'

// In-page anchors — AdminPage renders all sections on one route, so these
// just scroll-jump rather than navigate (unlike the homepage sidebar, which
// needs absolute /#section paths to work cross-page).
const LINKS = [
  { href: '#flyers', label: 'Flyers', icon: Image },
  { href: '#requests', label: 'Requests', icon: ClipboardList },
  { href: '#clients', label: 'Clients', icon: Users },
  { href: '#agents', label: 'Agents', icon: UserCheck },
]

export default function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true'
  )

  // Same key + CSS var as the homepage Sidebar, so collapsed state and
  // layout width stay consistent whichever one the user last touched.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? COLLAPSED_W : EXPANDED_W
    )
    localStorage.setItem(COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <>
      <button className="mobile-bar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-brand">
          {collapsed ? <strong>FT</strong> : <span><strong>FRAJAN TECH</strong><br />ADMIN</span>}
        </div>

        <nav className="sidebar-links">
          {LINKS.map((l) => {
            const Icon = l.icon
            return (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} title={collapsed ? l.label : undefined}>
                <Icon size={17} strokeWidth={2} />
                {!collapsed && <span>{l.label}</span>}
              </a>
            )
          })}
        </nav>

        <a href="/" className="sidebar-admin-link" title={collapsed ? 'Back to site' : undefined}>
          <ExternalLink size={13} /> {!collapsed && 'Back to site'}
        </a>

        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-w);
          background: var(--indigo);
          border-right: 1px solid var(--slate-line);
          padding: 28px 22px;
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow-y: auto;
          transition: width 0.18s ease;
        }
        .sidebar.collapsed {
          padding-left: 14px;
          padding-right: 14px;
          align-items: center;
        }
        .sidebar-collapse-toggle {
          position: absolute;
          top: 26px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--indigo);
          border: 1px solid var(--slate-line);
          color: var(--slate);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 51;
        }
        .sidebar-collapse-toggle:hover { color: var(--paper); border-color: var(--paper); }
        .sidebar-brand {
          font-family: var(--font-display);
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: 0.02em;
          color: var(--accent);
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--slate-line);
          width: 100%;
          text-align: center;
        }
        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          width: 100%;
        }
        .sidebar-links a {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--slate);
        }
        .sidebar-links a svg { flex-shrink: 0; opacity: 0.8; }
        .sidebar-links a:hover svg { opacity: 1; }
        .sidebar-links a:hover { background: var(--ink); color: var(--paper); }
        .sidebar-admin-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
          padding: 8px;
          font-size: 11px;
          font-weight: 500;
          color: var(--slate);
          opacity: 0.6;
        }
        .sidebar-admin-link:hover { opacity: 1; color: var(--paper); }
        .sidebar-close { display: none; }
        .mobile-bar-toggle { display: none; }
        .sidebar-overlay { display: none; }

        @media (max-width: 960px) {
          .sidebar-collapse-toggle { display: none; }
          .mobile-bar-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 16px;
            left: 16px;
            width: 42px;
            height: 42px;
            border-radius: 10px;
            background: var(--indigo);
            border: 1px solid var(--slate-line);
            color: var(--paper);
            font-size: 18px;
            z-index: 40;
            box-shadow: var(--shadow);
          }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: var(--shadow);
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-close {
            display: block;
            position: absolute;
            top: 22px;
            right: 18px;
            background: none;
            border: none;
            color: var(--slate);
            font-size: 16px;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(17, 24, 39, 0.35);
            z-index: 45;
          }
        }
      `}</style>
    </>
  )
}