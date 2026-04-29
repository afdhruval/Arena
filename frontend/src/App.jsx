import React, { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ModelCard from './components/ModelCard'
import JudgeVerdict from './components/JudgeVerdict'
import { runBattle } from './services/api'

const App = () => {
  const [history, setHistory] = useState([])
  const [currentPrompt, setCurrentPrompt] = useState(null)

  // Loading states
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [loadingJudge, setLoadingJudge] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Response data
  const [responseA, setResponseA] = useState(null)
  const [responseB, setResponseB] = useState(null)
  const [scoreA, setScoreA] = useState(null)
  const [scoreB, setScoreB] = useState(null)
  const [verdict, setVerdict] = useState(null)

  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleBattle = useCallback(async (prompt) => {
    setCurrentPrompt(prompt)
    setResponseA(null)
    setResponseB(null)
    setVerdict(null)
    setScoreA(null)
    setScoreB(null)
    setIsLoading(true)
    setLoadingA(true)
    setLoadingB(true) // Both models run in parallel on the backend now
    setLoadingJudge(false)

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    try {
      await runBattle(prompt, ({ stage, responseA: rA, responseB: rB, verdict: v }) => {
        switch (stage) {
          case 'models_loading':
            setLoadingA(true)
            setLoadingB(true)
            break
          case 'model_a_done':
            setLoadingA(false)
            setResponseA(rA.text)
            setScoreA(rA.score)
            break
          case 'model_b_done':
            setLoadingB(false)
            setResponseB(rB.text)
            setScoreB(rB.score)
            setLoadingJudge(true) // Start showing judge UI when both models are done
            break
          case 'judge_loading':
            setLoadingJudge(true)
            break
          case 'done':
            setLoadingJudge(false)
            setVerdict(v)
            setIsLoading(false)
            setHistory(prev => [{ prompt, time: timeStr }, ...prev.slice(0, 19)])
            showToast(`⚔️ Battle complete — ${v.winner === 'A' ? 'Mistral' : 'Cohere'} wins!`)
            break
        }
      })
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setLoadingA(false)
      setLoadingB(false)
      setLoadingJudge(false)
      showToast(`❌ Error: ${err.message || 'Battle failed'}`)
    }
  }, [])

  const hasBattle = currentPrompt !== null

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[#e2e2f0] bg-[#0f0f13] font-sans selection:bg-violet-500/30 selection:text-white">
      <Navbar isLoading={isLoading} />

      <div className="flex flex-1 overflow-hidden relative z-0">
        <Sidebar
          onSubmit={handleBattle}
          isLoading={isLoading}
          history={history}
        />

        <main className="flex-1 overflow-y-auto relative bg-grid">
          {/* Subtle background glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 py-8 relative z-10 pb-32">
            {!hasBattle ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center fade-in">
                <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/5 flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(124,58,237,0.15)] relative">
                  ⚔️
                  <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-[-10px] rounded-full border border-cyan-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gradient">
                  AI Battle Arena
                </h1>
                <p className="text-base text-[#8888aa] max-w-xl mx-auto leading-relaxed mb-10">
                  Submit a prompt to watch Mistral and Cohere go head-to-head in real-time.
                  A Gemini-powered judge evaluates both responses and declares a winner.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  {[
                    'Write a React hook for WebSocket connections',
                    'Explain quicksort with a Python implementation',
                    'Build a secure REST API architecture',
                    'Optimize a complex SQL JOIN query',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => handleBattle(s)}
                      className="px-4 py-3 bg-[#16161d] border border-[#2a2a3a] rounded-xl text-[#a78bfa] text-sm hover:bg-[#1e1e2a] hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all duration-300 text-left truncate"
                    >
                      <span className="opacity-50 mr-2">›</span> {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Prompt Banner */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#16161d] border border-[#2a2a3a] shadow-lg fade-in">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      Commander Prompt
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[#e2e2f0] text-sm leading-relaxed whitespace-pre-wrap">{currentPrompt}</div>
                  </div>
                </div>

                {/* Model Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ModelCard
                    model="a"
                    label="Mistral AI"
                    subLabel="mistral-medium-latest"
                    score={scoreA}
                    icon="🤖"
                    isLoading={loadingA}
                    response={responseA}
                  />
                  <ModelCard
                    model="b"
                    label="Cohere AI"
                    subLabel="command-a-03-2025"
                    score={scoreB}
                    icon="🚀"
                    isLoading={loadingB}
                    response={responseB}
                  />
                </div>

                {/* Judge Verdict */}
                {(loadingJudge || verdict) && (
                  <JudgeVerdict verdict={verdict} isLoading={loadingJudge} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-[#1e1e2a] border border-[#2a2a3a] rounded-xl shadow-2xl text-sm text-[#e2e2f0] flex items-center gap-3 slide-up z-50">
          {toast.includes('❌') ? (
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
          {toast.replace(/^(❌|⚔️)\s*/, '')}
        </div>
      )}
    </div>
  )
}

export default App