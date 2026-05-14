import React from 'react'

function ScoreCircle({ score, color }) {
  const r = 24, circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 30 30)"
        style={{ transition: 'stroke-dashoffset 0.9s ease' }}
      />
      <text x="30" y="35" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">{score}</text>
    </svg>
  )
}

export default function JudgeVerdict({ verdict, isLoading }) {
  if (isLoading) {
    return (
      <div className="fade-in" style={{
        borderRadius: 12, border: '1px solid var(--border)',
        background: 'var(--bg-panel)', padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Judge</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Powered by Gemini Flash</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
          <div className="spinner" style={{ width: 14, height: 14 }} />
          Evaluating responses…
        </div>
      </div>
    )
  }

  if (!verdict) return null

  const winnerIsA = verdict.winner === 'A'
  const winnerLabel = winnerIsA ? 'Mistral AI' : 'Cohere AI'

  return (
    <div className="fade-in" style={{
      borderRadius: 12, border: '1px solid var(--border)',
      background: 'var(--bg-panel)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Judge's Verdict</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>Gemini Flash</span>
          </div>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          fontSize: 12, fontWeight: 600,
          background: winnerIsA ? 'rgba(167,139,250,0.15)' : 'rgba(56,189,248,0.15)',
          color: winnerIsA ? '#a78bfa' : '#38bdf8',
          border: `1px solid ${winnerIsA ? 'rgba(167,139,250,0.3)' : 'rgba(56,189,248,0.3)'}`,
        }}>
          🏆 {winnerLabel} Wins
        </div>
      </div>

      {/* Body: 3-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, padding: '20px' }}>
        {/* Model A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mistral AI</span>
          </div>
          <ScoreCircle score={verdict.scoreA} color="#a78bfa" />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{verdict.analysisA}</p>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 28px' }}>
          <div style={{ fontSize: 28 }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', textAlign: 'center' }}>{winnerLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5, maxWidth: 140 }}>{verdict.reason}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', padding: '2px 8px', borderRadius: 20, background: 'rgba(167,139,250,0.1)' }}>{verdict.scoreA}/10</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>vs</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', padding: '2px 8px', borderRadius: 20, background: 'rgba(56,189,248,0.1)' }}>{verdict.scoreB}/10</span>
          </div>
        </div>

        {/* Model B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cohere AI</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
          </div>
          <ScoreCircle score={verdict.scoreB} color="#38bdf8" />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{verdict.analysisB}</p>
        </div>
      </div>
    </div>
  )
}
