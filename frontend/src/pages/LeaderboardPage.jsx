import React, { useState, useEffect } from 'react'
import { getLeaderboardData } from '../store/chatStore'

const STATIC_MODELS = [
  { name: 'Mistral AI', icon: '🤖', wins: 0, losses: 0, ties: 0, total: 0, winRate: 0 },
  { name: 'Cohere AI', icon: '🚀', wins: 0, losses: 0, ties: 0, total: 0, winRate: 0 },
]
const modelIcons = { 'Mistral AI': '🤖', 'Cohere AI': '🚀' }

export default function LeaderboardPage() {
  const [data, setData] = useState([])

  useEffect(() => {
    const lb = getLeaderboardData()
    const merged = [...STATIC_MODELS]
    lb.forEach(entry => {
      const idx = merged.findIndex(m => m.name === entry.name)
      if (idx !== -1) merged[idx] = { ...merged[idx], ...entry }
      else merged.push(entry)
    })
    setData(merged.sort((a, b) => b.wins - a.wins || b.winRate - a.winRate))
  }, [])

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 900, mx: 'auto', padding: '40px 20px', margin: '0 auto' }}>
        
        {/* Header matching arena.ai styling */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 48, marginBottom: 12,
          }}>🏆</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Rankings based on crowdsourced manual votes and AI judge verdicts.
            Help us find the best models by participating in the arena!
          </p>
        </div>

        {/* Table wrapper */}
        <div className="fade-in" style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr',
            background: 'var(--bg-card)', padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <div style={{ textAlign: 'center' }}>Rank</div>
            <div>Model</div>
            <div style={{ textAlign: 'right' }}>Win Rate</div>
            <div style={{ textAlign: 'right' }}>Wins</div>
            <div style={{ textAlign: 'right' }}>Battles</div>
          </div>

          {/* Table Body */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.map((model, i) => {
              const rank = i + 1
              const rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : rank === 3 ? '#b45309' : 'var(--text-dim)'
              
              return (
                <div key={model.name} style={{
                  display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr',
                  padding: '16px', borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-panel)', alignItems: 'center',
                  fontSize: 14, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                >
                  {/* Rank */}
                  <div style={{ textAlign: 'center', fontWeight: 700, color: rankColor, fontSize: 16 }}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  {/* Model */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{modelIcons[model.name] || '🤖'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.name}</span>
                  </div>

                  {/* Win Rate */}
                  <div style={{ textAlign: 'right', fontWeight: 600, color: model.winRate >= 50 ? '#22c55e' : 'var(--text-primary)' }}>
                    {model.winRate}%
                  </div>

                  {/* Wins */}
                  <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {model.wins}
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {model.total}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="fade-in" style={{
          marginTop: 24, padding: '16px 20px', borderRadius: 12,
          background: 'var(--bg-active)', border: '1px solid var(--border)',
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>How does it work?</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Models are ranked based on their win rate in blind side-by-side comparisons. 
              Both manual user votes and automated AI judge verdicts contribute to the total score.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
