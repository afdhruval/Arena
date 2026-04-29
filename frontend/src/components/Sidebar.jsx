import React, { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'Write a React hook for WebSocket connections',
  'Explain quicksort with code',
  'Build a REST API in Python Flask',
  'Optimize a slow SQL query',
  'Write a binary search in TypeScript',
]

const Sidebar = ({ onSubmit, isLoading, history }) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
    setInput('')
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  return (
    <aside className="flex flex-col w-72 shrink-0 border-r border-[#2a2a3a] bg-[#0f0f13] h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#8888aa]">Neural Link Active</span>
        </div>
        <p className="text-[11px] text-[#555570] mt-1">Prompt history</p>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
        {history.length === 0 ? (
          <div className="mt-6 text-center text-[#555570] text-xs leading-relaxed px-2">
            <div className="text-2xl mb-2">⚔️</div>
            No battles yet.<br />Send your first prompt!
          </div>
        ) : (
          history.map((item, i) => (
            <button
              key={i}
              onClick={() => onSubmit(item.prompt)}
              disabled={isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs leading-relaxed transition-all duration-200 group ${
                i === 0
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                  : 'text-[#8888aa] hover:bg-[#1e1e2a] hover:text-[#e2e2f0] border border-transparent'
              }`}
            >
              <span className="block truncate">
                {item.prompt.length > 65 ? item.prompt.slice(0, 65) + '…' : item.prompt}
              </span>
              <span className={`text-[10px] mt-0.5 block ${i === 0 ? 'text-violet-400/60' : 'text-[#555570]'}`}>
                {item.time}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Suggestions */}
      {history.length === 0 && (
        <div className="px-3 pb-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#555570] px-1 mb-2">Try these</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="w-full text-left px-3 py-2 rounded-lg text-[11px] text-[#8888aa] hover:text-violet-300 hover:bg-violet-600/10 border border-transparent hover:border-violet-500/20 transition-all duration-200 truncate"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-[#2a2a3a]">
        <div className="rounded-xl border border-[#2a2a3a] bg-[#16161d] focus-within:border-violet-500/50 focus-within:shadow-[0_0_16px_rgba(124,58,237,0.15)] transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What should the AI models battle about? (Enter to send)"
            disabled={isLoading}
            rows={3}
            className="w-full bg-transparent px-3 pt-3 pb-1 text-sm text-[#e2e2f0] placeholder-[#555570] resize-none outline-none max-h-40"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <span className="text-[10px] text-[#555570]">Shift+Enter for newline</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md hover:shadow-violet-500/30"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Fighting…
                </>
              ) : (
                <>⚡ Battle</>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
