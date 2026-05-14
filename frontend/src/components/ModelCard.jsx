import React, { useState } from 'react'

/* ── Markdown-lite renderer ── */
function ResponseRenderer({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  const segments = []
  let inCode = false, codeLang = '', codeLines = [], paraLines = []

  const flushPara = () => {
    if (paraLines.length) { segments.push({ type: 'text', content: paraLines.join('\n') }); paraLines = [] }
  }
  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (!inCode) { flushPara(); codeLang = line.slice(3).trim() || 'code'; inCode = true; codeLines = [] }
      else { segments.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') }); inCode = false; codeLines = []; codeLang = '' }
    } else if (inCode) codeLines.push(line)
    else paraLines.push(line)
  })
  if (inCode) segments.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') })
  flushPara()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.65 }}>
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return (
            <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 12px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 11, color: '#5865f2', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{seg.lang}</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                </div>
              </div>
              <pre style={{ margin: 0, borderRadius: 0, border: 'none' }}>{seg.content}</pre>
            </div>
          )
        }
        return seg.content.split('\n').filter(l => l.trim()).map((para, j) => {
          // Handle **bold** inline
          const parts = para.split(/(\*\*[^*]+\*\*)/g)
          return (
            <p key={`${i}-${j}`} style={{ color: 'var(--text-primary)' }}>
              {parts.map((p, k) =>
                p.startsWith('**') && p.endsWith('**')
                  ? <strong key={k}>{p.slice(2, -2)}</strong>
                  : p
              )}
            </p>
          )
        })
      })}
    </div>
  )
}

/* ── Score bar ── */
function ScoreBar({ score }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#5865f2' : '#f59e0b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{score}/10</span>
    </div>
  )
}

/* ── Main ModelCard ── */
export default function ModelCard({ model, label, subLabel, score, icon, isLoading, response, onRefresh }) {
  const isA = model === 'a'
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const labelText = isA ? 'Assistant A' : 'Assistant B'

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
        flex: 1, minWidth: 0,
        ...(expanded ? { position: 'fixed', inset: 60, zIndex: 200, borderRadius: 12 } : {}),
      }}
    >
      {/* Header: "Assistant A" / icons */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: isA ? '#a78bfa' : '#38bdf8',
            background: isA ? 'rgba(167,139,250,0.1)' : 'rgba(56,189,248,0.1)',
            padding: '2px 8px', borderRadius: 20,
            border: `1px solid ${isA ? 'rgba(167,139,250,0.25)' : 'rgba(56,189,248,0.25)'}`,
          }}>
            {labelText}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>
            {label}
          </span>
          {score != null && !isLoading && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
              background: 'var(--bg-active)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              {score}/10
            </span>
          )}
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Refresh */}
          <ActionBtn
            icon={<RefreshIcon />}
            title="Regenerate"
            onClick={onRefresh}
            disabled={isLoading}
          />
          {/* Copy */}
          <ActionBtn
            icon={copied ? <span style={{ fontSize: 11 }}>✓</span> : <CopyIcon />}
            title={copied ? 'Copied!' : 'Copy'}
            onClick={handleCopy}
            disabled={!response || isLoading}
          />
          {/* Expand */}
          <ActionBtn
            icon={expanded ? <CollapseIcon /> : <ExpandIcon />}
            title={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded(v => !v)}
          />
        </div>
      </div>

      {/* Score bar */}
      {score != null && !isLoading && <ScoreBar score={score} />}

      {/* Body */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        maxHeight: expanded ? 'none' : 400,
      }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 13, animation: 'pulse 1.5s infinite ease-in-out' }}>
            Generating...
          </div>
        ) : response ? (
          <ResponseRenderer text={response} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: 'var(--text-dim)', fontSize: 12, fontStyle: 'italic' }}>
            Awaiting prompt…
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ icon, title, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: 6, border: 'none',
        background: hov && !disabled ? 'var(--bg-hover)' : 'transparent',
        color: disabled ? 'var(--text-dim)' : hov ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s', flexShrink: 0,
      }}
    >
      {icon}
    </button>
  )
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M11 6.5A4.5 4.5 0 1 1 7.5 2.1" />
      <path d="M7.5 1v3h3" />
    </svg>
  )
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="4" y="4" width="8" height="8" rx="1.5"/>
      <path d="M2.5 9H2A1.5 1.5 0 0 1 .5 7.5V2A1.5 1.5 0 0 1 2 .5h5.5A1.5 1.5 0 0 1 9 2v.5"/>
    </svg>
  )
}
function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 1h4v4M5 12H1V8M12 1L7.5 5.5M1 12l4.5-4.5"/>
    </svg>
  )
}
function CollapseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5H8V1M1 8h4v4M8 5L12 1M1 12l4-4"/>
    </svg>
  )
}
