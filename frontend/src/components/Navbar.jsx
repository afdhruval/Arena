import React from 'react'

const Navbar = ({ isLoading }) => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[#2a2a3a] bg-[#0f0f13]/90 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg shadow-lg glow-brand">
          ⚔️
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-base tracking-tight text-gradient">AI Battle Arena</span>
          <span className="text-[10px] text-[#8888aa] tracking-widest uppercase">Neural Combat System</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="hidden md:flex items-center gap-6 text-sm text-[#8888aa]">
        <li><a href="#" className="hover:text-violet-400 transition-colors duration-200 text-violet-400 font-medium">Arena</a></li>
        <li><a href="#" className="hover:text-violet-400 transition-colors duration-200">Leaderboard</a></li>
        <li><a href="#" className="hover:text-violet-400 transition-colors duration-200">Archives</a></li>
      </ul>

      {/* Status pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161d] border border-[#2a2a3a] text-xs text-[#8888aa]">
        <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
        {isLoading ? 'Battle in progress…' : 'Ready to fight'}
      </div>
    </nav>
  )
}

export default Navbar
