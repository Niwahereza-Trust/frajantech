import { useState, useEffect } from 'react'
import { Home, Signal, Package, Workflow, LifeBuoy, Menu, X, ArrowRight, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import SignalBars from './SignalBars.jsx'
import { useConnectModal } from '../context/ConnectModalContext.jsx'

const COLLAPSE_KEY = 'ft_sidebar_collapsed'
const EXPANDED_W = '240px'
const COLLAPSED_W = '76px'

// Absolute paths (/#home, not #home) so these links work correctly from
// any page — including /admin, which has no #home section of its own to
// scroll to. A bare #home only works when you're already on the homepage.
const LINKS = [
  { href: '/#home', label: 'Home', icon: Home },
  { href: '/#check-status', label: 'Check Status', icon: Signal },
  { href: '/#packages', label: 'Packages', icon: Package },
  { href: '/#how', label: 'How It Works', icon: Workflow },
  { href: '/#support', label: 'Support', icon: LifeBuoy },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true'
  )
  const { open: openConnect } = useConnectModal()

  // Drives --sidebar-w on the root element directly, so any other layout
  // (e.g. main content using margin-left: var(--sidebar-w)) stays in sync
  // on both the homepage and /admin without needing to touch those files.
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

        <a href="/#home" className="sidebar-brand" onClick={() => setOpen(false)}>
          <SignalBars variant="accent" />
          {!collapsed && <span><strong>FRAJAN TECH</strong><br />UNLIMITED</span>}
        </a>

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

        <button
          className="btn btn-primary sidebar-cta"
          onClick={() => { setOpen(false); openConnect('connection') }}
          title={collapsed ? 'Get Connected' : undefined}
        >
          <ArrowRight size={16} /> {!collapsed && 'Get Connected'}
        </button>

        <a href="/admin" className="sidebar-admin-link" title={collapsed ? 'Admin' : undefined}>
          <Lock size={13} /> {!collapsed && 'Admin'}
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
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-display);
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: 0.02em;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--slate-line);
        }
        .sidebar-brand strong { color: var(--accent); }
        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
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
        .sidebar-links a svg {
          flex-shrink: 0;
          opacity: 0.8;
        }
        .sidebar-links a:hover svg {
          opacity: 1;
        }
        .sidebar-links a:hover {
          background: var(--ink);
          color: var(--paper);
        }
        .sidebar-cta {
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
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
        .sidebar-close {
          display: none;
        }
        .mobile-bar-toggle {
          display: none;
        }
        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 960px) {
          .sidebar-collapse-toggle {
            display: none;
          }
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