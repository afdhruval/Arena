import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { runBattle } from '../services/api'
import { createSession, recordJudgeVerdict } from '../store/chatStore'
import ModelCard from '../components/ModelCard'
import JudgeVerdict from '../components/JudgeVerdict'
import VotingPanel from '../components/VotingPanel'

const SUGGESTIONS = [
  'Write a React hook for WebSocket connections',
  'Explain quicksort with a Python implementation',
  'Build a secure REST API architecture',
  'Optimize a complex SQL JOIN query',
  'Design a microservices architecture',
  'Explain the CAP theorem with examples',
]

export default function DashboardPage({ onSessionCreated, loadedSession, onLoadingChange }) {
  const { canPrompt, incrementFreePrompts, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [input, setInput] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [loadingJudge, setLoadingJudge] = useState(false)

  const [responseA, setResponseA] = useState(null)
  const [responseB, setResponseB] = useState(null)
  const [scoreA, setScoreA] = useState(null)
  const [scoreB, setScoreB] = useState(null)
  const [verdict, setVerdict] = useState(null)
  const [currentSession, setCurrentSession] = useState(null)

  const [toast, setToast] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Load session from history
  useEffect(() => {
    if (loadedSession) {
      setCurrentPrompt(loadedSession.prompt)
      setResponseA(loadedSession.responseA)
      setResponseB(loadedSession.responseB)
      setVerdict(loadedSession.verdict || null)
      setScoreA(loadedSession.verdict?.scoreA || null)
      setScoreB(loadedSession.verdict?.scoreB || null)
      setCurrentSession(loadedSession)
    }
  }, [loadedSession])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleBattle = useCallback(async (prompt) => {
    const p = (prompt || input).trim()
    if (!p) return

    if (!canPrompt) { setShowLoginPrompt(true); return }

    setCurrentPrompt(p)
    setInput('')
    setResponseA(null); setResponseB(null)
    setVerdict(null); setScoreA(null); setScoreB(null)
    setCurrentSession(null)
    setIsLoading(true); setLoadingA(true); setLoadingB(true); setLoadingJudge(false)
    if (onLoadingChange) onLoadingChange(true)
    if (!isLoggedIn) incrementFreePrompts()

    let latestA = null, latestB = null

    try {
      await runBattle(p, ({ stage, responseA: rA, responseB: rB, verdict: v }) => {
        switch (stage) {
          case 'models_loading': setLoadingA(true); setLoadingB(true); break
          case 'model_a_done': latestA = rA; setLoadingA(false); setResponseA(rA.text); setScoreA(rA.score); break
          case 'model_b_done': latestB = rB; setLoadingB(false); setResponseB(rB.text); setScoreB(rB.score); setLoadingJudge(true); break
          case 'judge_loading': setLoadingJudge(true); break
          case 'done': {
            setLoadingJudge(false); setVerdict(v); setIsLoading(false)
            if (onLoadingChange) onLoadingChange(false)
            const sess = createSession({
              prompt: p,
              responseA: latestA?.text || '',
              responseB: latestB?.text || '',
              verdict: v,
              modelA: 'Mistral AI', modelB: 'Cohere AI',
            })
            setCurrentSession(sess)
            recordJudgeVerdict(sess, v.winner)
            if (onSessionCreated) onSessionCreated(sess)
            showToast(`Battle complete — ${v.winner === 'A' ? 'Mistral' : 'Cohere'} wins!`)
            break
          }
        }
      })
    } catch (err) {
      console.error(err)
      setIsLoading(false); setLoadingA(false); setLoadingB(false); setLoadingJudge(false)
      if (onLoadingChange) onLoadingChange(false)
      showToast(`Error: ${err.message || 'Battle failed'}`, 'error')
    }
  }, [input, canPrompt, isLoggedIn, onLoadingChange, onSessionCreated, incrementFreePrompts])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBattle() }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px'
    }
  }, [input])

  const hasBattle = currentPrompt !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* ── SCROLL AREA ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 200px' }}>

        {!hasBattle ? (
          /* ── Empty / Hero ── */
          <div className="fade-in" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Experience the frontier
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6, marginBottom: 32 }}>
              Submit a prompt to watch <strong style={{ color: 'var(--text-primary)' }}>Mistral</strong> and{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Cohere</strong> battle head-to-head, judged by{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Gemini</strong>.
            </p>

            {/* Suggestion chips */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 8, maxWidth: 600, width: '100%',
            }}>
              {SUGGESTIONS.map(s => (
                <SuggestionChip key={s} text={s} onClick={() => handleBattle(s)} />
              ))}
            </div>
          </div>
        ) : (
          /* ── Battle ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200, margin: '0 auto' }}>

            {/* User prompt bubble */}
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '70%', padding: '10px 14px',
                borderRadius: '14px 14px 4px 14px',
                background: 'var(--bg-active)',
                border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6,
              }}>
                {currentPrompt}
              </div>
            </div>

            {/* Model cards side-by-side */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ModelCard
                model="a" label="Mistral AI" subLabel="mistral-medium-latest"
                score={scoreA} icon="🤖" isLoading={loadingA} response={responseA}
              />
              <ModelCard
                model="b" label="Cohere AI" subLabel="command-a-03-2025"
                score={scoreB} icon="🚀" isLoading={loadingB} response={responseB}
              />
            </div>

            {/* Voting panel */}
            {responseA && responseB && !isLoading && (
              <VotingPanel
                sessionId={currentSession?.id}
                existingVote={currentSession?.vote}
                onVote={(v) => currentSession && setCurrentSession(s => ({ ...s, vote: v }))}
              />
            )}

            {/* Judge verdict */}
            {(loadingJudge || verdict) && (
              <JudgeVerdict verdict={verdict} isLoading={loadingJudge} />
            )}
          </div>
        )}
      </div>

      {/* ── FIXED INPUT BAR ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 20px 16px',
        background: 'linear-gradient(to top, var(--bg-base) 80%, transparent)',
      }}>
        {/* Login gate */}
        {showLoginPrompt && (
          <div className="fade-in" style={{
            marginBottom: 10, padding: '10px 14px',
            borderRadius: 10, border: '1px solid #5865f240',
            background: '#5865f210',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>You've used all 3 free battles</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sign in for unlimited access</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => setShowLoginPrompt(false)} style={{
                padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12,
              }}>Dismiss</button>
              <button onClick={() => navigate('/login')} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: '#5865f2', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>Sign In →</button>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Input container */}
          <div style={{
            borderRadius: 14, border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            padding: '10px 12px 8px',
          }}>
            <textarea
              ref={inputRef}
              id="battle-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={canPrompt ? 'Ask a followup…' : 'Sign in to continue…'}
              disabled={isLoading || !canPrompt}
              rows={1}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                outline: 'none', resize: 'none', color: 'var(--text-primary)',
                fontSize: 13, lineHeight: 1.5, maxHeight: 140,
                fontFamily: 'var(--font-sans)',
              }}
            />

            {/* Toolbar row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              {/* Left tools (removed as requested) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              </div>

              {/* Right: send */}
              <button
                id="battle-submit-btn"
                onClick={() => handleBattle()}
                disabled={!input.trim() || isLoading || !canPrompt}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: !input.trim() || isLoading || !canPrompt ? 'var(--bg-hover)' : '#e8e8e8',
                  color: !input.trim() || isLoading || !canPrompt ? 'var(--text-dim)' : '#111',
                  cursor: !input.trim() || isLoading || !canPrompt ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                {isLoading ? (
                  <div className="spinner" style={{ width: 14, height: 14, borderColor: 'var(--border-light)', borderTopColor: 'var(--text-secondary)' }} />
                ) : (
                  <SendIcon />
                )}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-dim)', marginTop: 8 }}>
            Inputs are processed by third-party AI and responses may be inaccurate.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: 90, right: 20,
          padding: '10px 14px', borderRadius: 10,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--text-primary)', zIndex: 300,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: toast.type === 'error' ? '#ef4444' : '#22c55e', display: 'inline-block' }} />
          {toast.msg}
        </div>
      )}
    </div>
  )
}

/* Suggestion chip */
function SuggestionChip({ text, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 12px', borderRadius: 9, textAlign: 'left',
        border: `1px solid ${hov ? 'var(--border-light)' : 'var(--border)'}`,
        background: hov ? 'var(--bg-hover)' : 'var(--bg-panel)',
        color: 'var(--text-secondary)',
        fontSize: 12, cursor: 'pointer', lineHeight: 1.4,
        transition: 'all 0.15s',
      }}
    >
      {text}
    </button>
  )
}

/* Tool button */
function ToolBtn({ icon, title }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: hov ? 'var(--bg-hover)' : 'transparent',
        color: hov ? 'var(--text-primary)' : 'var(--text-dim)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
      }}
    >
      {icon}
    </button>
  )
}

/* Icons */
function PaperclipIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M11 6.5L6.5 11a3.5 3.5 0 0 1-4.95-4.95L7 1.5a2 2 0 0 1 2.83 2.83L5 9a.5.5 0 0 1-.71-.71L8.5 4"/></svg>
}
function GlobeIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 1.5c-2.2 2.2-2.2 8.8 0 11M7 1.5c2.2 2.2 2.2 8.8 0 11M1.5 7h11"/></svg>
}
function ImageIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="1" width="12" height="12" rx="2"/><circle cx="4.5" cy="4.5" r="1"/><path d="M1 9.5l3-3 3 3 2-2 3 3"/></svg>
}
function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4L1 7l3 3M10 4l3 3-3 3M8 2l-2 10"/></svg>
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 1l12 6L1 13V8.5l8-1.5L1 5.5V1z"/></svg>
}
