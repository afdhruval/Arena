import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* Arena.ai‑style top bar:
   [☰ Logo]   [Battle Mode ▾]   [... Login]
*/
export default function Navbar({ onToggleSidebar, isLoading }) {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const [modeOpen, setModeOpen] = useState(false)
  const [mode, setMode] = useState('Battle Mode')
  const modeRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (modeRef.current && !modeRef.current.contains(e.target)) setModeOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        padding: '0 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* LEFT: sidebar toggle + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          id="sidebar-toggle"
          onClick={onToggleSidebar}
          style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: 16,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect y="2" width="16" height="1.5" rx="0.75"/>
            <rect y="7.25" width="16" height="1.5" rx="0.75"/>
            <rect y="12.5" width="16" height="1.5" rx="0.75"/>
          </svg>
        </button>

        {/* Arena Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #5865f2, #9b59b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>⚔️</div>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: 'var(--text-primary)', letterSpacing: '-0.2px',
          }}>Arena</span>
        </div>
      </div>

      {/* CENTER: Battle Mode dropdown */}
      <div ref={modeRef} style={{ position: 'relative' }}>
        <button
          id="battle-mode-btn"
          onClick={() => setModeOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--bg-active)',
            color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          {/* Two-swords icon */}
          <span style={{ fontSize: 13 }}>⚔️</span>
          <span>{mode}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.5, marginLeft: 2 }}>
            <path d="M6 8L2 4h8L6 8z"/>
          </svg>
        </button>

        {modeOpen && (
          <div
            className="scale-in"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: '50%',
              transform: 'translateX(-50%)',
              minWidth: 180,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 200, overflow: 'hidden',
              padding: '4px',
            }}
          >
            {['Battle Mode', 'Direct Chat'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setModeOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 10px',
                  borderRadius: 6, border: 'none',
                  background: mode === m ? 'var(--bg-active)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 13, textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (mode !== m) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (mode !== m) e.currentTarget.style.background = 'transparent' }}
              >
                <span>{m === 'Battle Mode' ? '⚔️' : '💬'}</span> {m}
                {mode === m && <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 11 }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: extras + login */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Status dot when loading */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 5, background: 'var(--bg-active)', fontSize: 11, color: 'var(--text-secondary)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            Battling…
          </div>
        )}

        {/* Ellipsis menu */}
        <button
          style={{
            width: 32, height: 32, borderRadius: 6, border: 'none',
            background: 'transparent', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ···
        </button>

        {/* Login / Avatar */}
        {isLoggedIn ? (
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--border-light)', cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => { logout(); navigate('/login') }}
            title="Click to logout"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #5865f2, #9b59b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
              }}>
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
        ) : (
          <button
            id="nav-login-btn"
            onClick={() => navigate('/login')}
            style={{
              padding: '5px 14px', borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'var(--bg-active)',
              color: 'var(--text-primary)',
              fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  )
}
