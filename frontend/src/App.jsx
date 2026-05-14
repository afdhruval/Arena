import React, { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'

function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)        // forces DashboardPage remount on "New Chat"
  const [loadedSession, setLoadedSession] = useState(null)
  const [activeSessions, setActiveSessions] = useState(0) // bumped whenever a session is created
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSessionCreated = useCallback((sess) => {
    setCurrentSessionId(sess.id)
    setActiveSessions(n => n + 1)
  }, [])

  const handleSessionSelect = useCallback((sess) => {
    setLoadedSession(sess)
    setCurrentSessionId(sess.id)
    setSessionKey(k => k + 1)
  }, [])

  const handleNewChat = useCallback(() => {
    setLoadedSession(null)
    setCurrentSessionId(null)
    setSessionKey(k => k + 1)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      <Navbar
        isLoading={isLoading}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-1 overflow-hidden relative z-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          activeSessions={activeSessions}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onSubmit={handleNewChat}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  key={sessionKey}
                  onSessionCreated={handleSessionCreated}
                  loadedSession={loadedSession}
                  onLoadingChange={setIsLoading}
                />
              }
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}