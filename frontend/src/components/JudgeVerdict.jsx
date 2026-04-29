import React from 'react'

const ScoreCircle = ({ score, label, color }) => {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2a2a3a" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">
          {score}
        </text>
      </svg>
      <span className="text-[11px] text-[#8888aa] font-medium">{label}</span>
    </div>
  )
}

const JudgeVerdict = ({ verdict, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-[#16161d] p-6 slide-in mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg">⚖️</div>
          <div>
            <div className="font-semibold text-[#e2e2f0] text-sm">Judge's Verdict</div>
            <div className="text-[11px] text-[#8888aa]">Powered by Gemini 1.5 Flash</div>
          </div>
        </div>
        <div className="flex items-center gap-3 py-4 text-[#8888aa] text-sm">
          <span className="w-5 h-5 border border-amber-400/40 border-t-amber-400 rounded-full animate-spin shrink-0" />
          Evaluating both responses… The Judge is deliberating.
        </div>
      </div>
    )
  }

  if (!verdict) return null

  const winnerIsA = verdict.winner === 'A'
  const winnerLabel = winnerIsA ? 'Mistral AI' : 'Cohere AI'
  const winnerIcon = winnerIsA ? '🤖' : '🚀'

  return (
    <div className="rounded-2xl border border-[#2a2a3a] bg-[#16161d] overflow-hidden mt-4 slide-up fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-gradient-to-r from-[#1a1a26] to-[#16161d]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg">⚖️</div>
          <div>
            <div className="font-semibold text-[#e2e2f0] text-sm">Judge's Verdict</div>
            <div className="text-[11px] text-[#8888aa]">Powered by Gemini 1.5 Flash</div>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
          winnerIsA
            ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
            : 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
        }`}>
          {winnerIcon} {winnerLabel} Wins!
        </div>
      </div>

      {/* Score circles + analysis grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model A Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Mistral AI</span>
          </div>
          <ScoreCircle score={verdict.scoreA} label={`Score: ${verdict.scoreA}/10`} color="#a78bfa" />
          <p className="text-xs text-[#c9c9e0] leading-relaxed">{verdict.analysisA}</p>
        </div>

        {/* Winner banner (center) */}
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <div className="text-4xl">🏆</div>
          <div className={`font-bold text-lg ${winnerIsA ? 'text-gradient' : 'text-gradient'}`}>
            {winnerLabel}
          </div>
          <div className="text-[11px] text-[#8888aa] leading-relaxed max-w-[180px]">
            {verdict.reason}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-violet-400 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
              {verdict.scoreA}/10
            </span>
            <span className="text-[10px] text-[#555570]">vs</span>
            <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {verdict.scoreB}/10
            </span>
          </div>
        </div>

        {/* Model B Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Cohere AI</span>
          </div>
          <ScoreCircle score={verdict.scoreB} label={`Score: ${verdict.scoreB}/10`} color="#06b6d4" />
          <p className="text-xs text-[#c9c9e0] leading-relaxed">{verdict.analysisB}</p>
        </div>
      </div>
    </div>
  )
}

export default JudgeVerdict
