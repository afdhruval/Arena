import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSessions } from '../store/chatStore'

/* Arena.ai‑style sidebar:
   Top: New Chat, Leaderboard, Search
   Mid: "Today" history section with chat entries
   Bot: Account panel
*/
export default function Sidebar({
  collapsed, onToggleCollapse,
  activeSessions, currentSessionId,
  onSessionSelect, onNewChat,
}) {
  const { user, isLoggedIn, logout, theme, toggleTheme, canPrompt, promptsLeft, FREE_LIMIT } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sessions, setSessions] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    setSessions(getSessions())
  }, [activeSessions, currentSessionId])

  useEffect(() => {
    const h = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus()
  }, [showSearch])

  const filtered = sessions.filter(s => {
    if (!searchQ.trim()) return true
    const q = searchQ.toLowerCase()
    return s.prompt?.toLowerCase().includes(q) || s.modelA?.toLowerCase().includes(q) || s.modelB?.toLowerCase().includes(q)
  })

  const grouped = (() => {
    const today = [], yesterday = [], older = []
    const now = Date.now()
    filtered.forEach(s => {
      const age = now - new Date(s.createdAt).getTime()
      if (age < 86400000) today.push(s)
      else if (age < 172800000) yesterday.push(s)
      else older.push(s)
    })
    return { Today: today, Yesterday: yesterday, Earlier: older }
  })()

  const isLeaderboard = location.pathname === '/leaderboard'

  /* ── Collapsed state ── */
  if (collapsed) {
    return (
      <aside style={{
        width: 48, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 8, gap: 4,
        height: '100%', overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}>
        <IconBtn icon="✦" title="New Chat" onClick={() => { navigate('/dashboard'); onNewChat?.() }} />
        <IconBtn icon="🏆" title="Leaderboard" onClick={() => navigate('/leaderboard')} active={isLeaderboard} />
        <IconBtn icon="🔍" title="Search" onClick={() => { onToggleCollapse(); setShowSearch(true) }} />
        <div style={{ flex: 1 }} />
        <Avatar user={user} size={30} onClick={() => setShowAccountMenu(v => !v)} style={{ marginBottom: 8 }} />
      </aside>
    )
  }

  return (
    <aside
      className="slide-in-left"
      style={{
        width: 240, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}
    >
      {/* ── Top Nav ── */}
      <div style={{ padding: '8px 8px 4px' }}>

        {/* New Chat */}
        <NavItem
          icon={<PlusIcon />}
          label="New Chat"
          id="new-chat-btn"
          onClick={() => { navigate('/dashboard'); onNewChat?.() }}
        />

        {/* Leaderboard */}
        <NavItem
          icon={<span style={{ fontSize: 14 }}>🏆</span>}
          label="Leaderboard"
          id="nav-leaderboard"
          active={isLeaderboard}
          onClick={() => navigate('/leaderboard')}
        />

        {/* Search */}
        <NavItem
          icon={<SearchIcon />}
          label="Search"
          id="nav-search"
          active={showSearch}
          onClick={() => setShowSearch(v => !v)}
        />

        {/* Search Box */}
        {showSearch && (
          <div className="fade-in" style={{ marginTop: 4, position: 'relative' }}>
            <input
              ref={searchRef}
              id="sidebar-search"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search chats…"
              style={{
                width: '100%', padding: '7px 28px 7px 10px',
                borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--bg-input)', color: 'var(--text-primary)',
                fontSize: 12, outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#5865f2'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12,
              }}>✕</button>
            )}
          </div>
        )}
      </div>

      {/* ── Free prompts bar (guest) ── */}
      {!isLoggedIn && (
        <div style={{ margin: '4px 8px 0', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-active)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Free battles left</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: promptsLeft === 0 ? '#ef4444' : '#5865f2' }}>
              {promptsLeft}/{FREE_LIMIT}
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${(promptsLeft / FREE_LIMIT) * 100}%`,
              background: promptsLeft === 0 ? '#ef4444' : '#5865f2',
              transition: 'width 0.4s ease',
            }} />
          </div>
          {promptsLeft === 0 && (
            <button onClick={() => navigate('/login')} style={{
              marginTop: 6, width: '100%', padding: '5px', borderRadius: 5,
              border: 'none', background: '#5865f2', color: '#fff',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              Sign in for unlimited →
            </button>
          )}
        </div>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

      {/* ── Chat History ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {Object.entries(grouped).map(([group, items]) => items.length === 0 ? null : (
          <div key={group}>
            <div style={{ padding: '4px 8px 2px', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.3px' }}>
              {group}
            </div>
            {items.map(s => (
              <HistoryItem
                key={s.id}
                session={s}
                active={s.id === currentSessionId}
                onClick={() => { navigate('/dashboard'); onSessionSelect?.(s) }}
              />
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)', fontSize: 12 }}>
            {showSearch && searchQ ? 'No matching chats' : 'No battle history yet'}
          </div>
        )}
      </div>

      {/* ── Account Panel ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '6px 8px' }} ref={accountRef}>
        {/* Dropdown */}
        {showAccountMenu && (
          <div
            className="scale-in"
            style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 8, right: 8,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: '0 -8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden', padding: '4px', zIndex: 100,
            }}
          >
            <MenuRow icon="🌙" label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} onClick={() => { toggleTheme(); setShowAccountMenu(false) }} />
            {isLoggedIn
              ? <MenuRow icon="🚪" label="Logout" red onClick={() => { logout(); navigate('/login'); setShowAccountMenu(false) }} />
              : <MenuRow icon="🔑" label="Sign In" onClick={() => { navigate('/login'); setShowAccountMenu(false) }} />
            }
          </div>
        )}

        <button
          id="account-btn"
          onClick={() => setShowAccountMenu(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px', borderRadius: 8, border: 'none',
            background: 'transparent', cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar user={user} size={28} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Guest'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'Not signed in'}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--text-dim)">
            <path d="M6 4L2 8h8L6 4z"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function NavItem({ icon, label, onClick, active, id }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 7, border: 'none',
        background: active ? 'var(--bg-active)' : hov ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.1s',
      }}
    >
      <span style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  )
}

function HistoryItem({ session, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start',
        padding: '5px 8px', borderRadius: 7, border: 'none',
        background: active ? 'var(--bg-active)' : hov ? 'var(--bg-hover)' : 'transparent',
        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
      }}
    >
      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div style={{
          fontSize: 12, fontWeight: active ? 500 : 400,
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {session.prompt?.length > 45 ? session.prompt.slice(0, 45) + '…' : session.prompt}
        </div>
        {active && session.vote && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>✓ voted</div>
        )}
      </div>
    </button>
  )
}

function MenuRow({ icon, label, onClick, red }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 6, border: 'none',
        background: hov ? 'var(--bg-hover)' : 'transparent',
        color: red ? '#ef4444' : 'var(--text-primary)',
        fontSize: 13, cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span>{icon}</span> {label}
    </button>
  )
}

function IconBtn({ icon, title, onClick, active }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 7, border: 'none',
        background: active ? 'var(--bg-active)' : hov ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >{icon}</button>
  )
}

function Avatar({ user, size = 28, onClick, style: extraStyle }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', border: '1.5px solid var(--border-light)',
        cursor: onClick ? 'pointer' : 'default',
        ...extraStyle,
      }}
    >
      {user?.photoURL ? (
        <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #5865f2, #9b59b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: size * 0.4,
        }}>
          {user?.name?.[0] || 'G'}
        </div>
      )}
    </div>
  )
}

/* Icons */
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M10 10l2.5 2.5"/>
    </svg>
  )
}
