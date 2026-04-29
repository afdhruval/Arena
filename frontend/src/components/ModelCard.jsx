import React from 'react'

const ResponseRenderer = ({ text }) => {
  const lines = text.split('\n')
  const segments = []
  let inCode = false
  let codeLang = ''
  let codeLines = []
  let paraLines = []

  const flushPara = () => {
    if (paraLines.length) {
      segments.push({ type: 'text', content: paraLines.join('\n') })
      paraLines = []
    }
  }

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (!inCode) {
        flushPara()
        codeLang = line.slice(3).trim() || 'code'
        inCode = true
        codeLines = []
      } else {
        segments.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') })
        inCode = false
        codeLines = []
        codeLang = ''
      }
    } else if (inCode) {
      codeLines.push(line)
    } else {
      paraLines.push(line)
    }
  })

  if (inCode && codeLines.length) {
    segments.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') })
  }
  flushPara()

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return (
            <div key={i} className="rounded-lg overflow-hidden border border-[#2a2a3a]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f13] border-b border-[#2a2a3a]">
                <span className="text-[10px] uppercase tracking-widest text-violet-400 font-mono font-semibold">{seg.lang}</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
              </div>
              <pre className="px-4 py-3 text-xs font-mono text-[#c9d1d9] overflow-x-auto bg-[#0d0d11] leading-relaxed">{seg.content}</pre>
            </div>
          )
        }
        return seg.content.split('\n').filter(l => l.trim()).map((para, j) => (
          <p key={`${i}-${j}`} className="text-[#c9c9e0]">{para}</p>
        ))
      })}
    </div>
  )
}

const ScoreBar = ({ score }) => {
  const pct = (score / 10) * 100
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#a78bfa' : '#f59e0b'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}/10</span>
    </div>
  )
}

const ModelCard = ({ model, label, subLabel, score, icon, isLoading, response }) => {
  const isA = model === 'a'
  const accentColor = isA ? 'violet' : 'cyan'

  return (
    <div className={`flex flex-col rounded-2xl border bg-[#16161d] overflow-hidden slide-up ${
      isA ? 'border-violet-500/20' : 'border-cyan-500/20'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${
        isA ? 'border-violet-500/10 bg-violet-600/5' : 'border-cyan-500/10 bg-cyan-600/5'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            isA ? 'bg-violet-600/20 border border-violet-500/30' : 'bg-cyan-600/20 border border-cyan-500/30'
          }`}>
            {icon}
          </div>
          <div>
            <div className="font-semibold text-sm text-[#e2e2f0]">{label}</div>
            <div className="text-[11px] text-[#8888aa]">{subLabel}</div>
          </div>
        </div>
        {score != null && !isLoading ? (
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            isA ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            {score}/10
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-lg text-xs text-[#555570] bg-[#1e1e2a] border border-[#2a2a3a]">
            —
          </div>
        )}
      </div>

      {/* Score bar (only after result) */}
      {score != null && !isLoading && (
        <div className="px-5 py-2 border-b border-[#2a2a3a]">
          <ScoreBar score={score} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-5 py-4 overflow-y-auto max-h-96">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-[#555570]">
            <div className="dot-pulse flex gap-2">
              <span /><span /><span />
            </div>
            <span className="text-xs">Generating response…</span>
          </div>
        ) : response ? (
          <ResponseRenderer text={response} />
        ) : (
          <p className="text-[#555570] text-sm italic text-center py-8">Awaiting battle prompt…</p>
        )}
      </div>
    </div>
  )
}

export default ModelCard
