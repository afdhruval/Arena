import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const FREE_LIMIT = 3

// Simulated Google OAuth (replace with real Firebase/Google OAuth in production)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [freePrompts, setFreePrompts] = useState(0)
  const [theme, setTheme] = useState('dark')
  const [authLoading, setAuthLoading] = useState(true)

  // Load persisted session on mount
  useEffect(() => {
    const stored = localStorage.getItem('arena_user')
    const storedPrompts = parseInt(localStorage.getItem('arena_free_prompts') || '0', 10)
    const storedTheme = localStorage.getItem('arena_theme') || 'dark'
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setFreePrompts(storedPrompts)
    setTheme(storedTheme)
    setAuthLoading(false)
  }, [])

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', theme === 'light')
    localStorage.setItem('arena_theme', theme)
  }, [theme])

  const login = useCallback((userData) => {
    const u = { ...userData, loginTime: Date.now() }
    setUser(u)
    localStorage.setItem('arena_user', JSON.stringify(u))
    // Reset free prompt counter on login
    setFreePrompts(0)
    localStorage.setItem('arena_free_prompts', '0')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('arena_user')
  }, [])

  const incrementFreePrompts = useCallback(() => {
    setFreePrompts(prev => {
      const next = prev + 1
      localStorage.setItem('arena_free_prompts', String(next))
      return next
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  const canPrompt = user !== null || freePrompts < FREE_LIMIT
  const promptsLeft = Math.max(0, FREE_LIMIT - freePrompts)
  const isLoggedIn = user !== null

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      freePrompts, incrementFreePrompts,
      canPrompt, promptsLeft, FREE_LIMIT,
      isLoggedIn,
      theme, toggleTheme,
      authLoading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
