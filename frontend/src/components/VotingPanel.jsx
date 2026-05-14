import React, { useState } from 'react'
import { updateSessionVote } from '../store/chatStore'

/* Arena.ai vote row:
   [← A is better]  [Both are good]  [Both are bad]  [B is better →]
*/
const VOTES = [
  { id: 'A',         label: '← A is better',   icon: null },
  { id: 'both_good', label: '✓ Both are good',  icon: null },
  { id: 'both_bad',  label: '✗ Both are bad',   icon: null },
  { id: 'B',         label: 'B is better →',    icon: null },
]

export default function VotingPanel({ sessionId, existingVote, onVote }) {
  const [vote, setVote] = useState(existingVote || null)
  const [hovering, setHovering] = useState(null)

  const handleVote = (id) => {
    if (vote) return
    setVote(id)
    if (sessionId) updateSessionVote(sessionId, id)
    if (onVote) onVote(id)
  }

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, padding: '16px 0 4px',
      }}
    >
      {/* Label */}
      {!vote && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
          Which response was better?
        </p>
      )}

      {/* Vote buttons row — exactly like arena.ai */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {VOTES.map(opt => {
          const isSelected = vote === opt.id
          const isOther = vote && !isSelected

          return (
            <button
              key={opt.id}
              id={`vote-${opt.id}`}
              onClick={() => handleVote(opt.id)}
              onMouseEnter={() => !vote && setHovering(opt.id)}
              onMouseLeave={() => setHovering(null)}
              disabled={!!vote && !isSelected}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: `1px solid ${isSelected ? 'var(--border-light)' : 'var(--border)'}`,
                background: isSelected
                  ? 'var(--bg-active)'
                  : hovering === opt.id
                  ? 'var(--bg-hover)'
                  : 'var(--bg-panel)',
                color: isOther
                  ? 'var(--text-dim)'
                  : isSelected
                  ? 'var(--text-primary)'
                  : hovering === opt.id
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
                fontSize: 13, fontWeight: isSelected ? 600 : 400,
                cursor: vote ? (isSelected ? 'default' : 'not-allowed') : 'pointer',
                opacity: isOther ? 0.4 : 1,
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
            >
              {opt.label}
              {isSelected && <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.6 }}>✓</span>}
            </button>
          )
        })}
      </div>

      {/* Confirmation */}
      {vote && (
        <p className="fade-in" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
          Vote recorded · Results are reflected in the leaderboard
        </p>
      )}
    </div>
  )
}
