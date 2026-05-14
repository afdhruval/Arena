/**
 * chatStore.js — localStorage-backed chat history store
 * Manages all sessions, votes, and leaderboard data.
 */

const STORAGE_KEYS = {
  SESSIONS: 'arena_sessions',
  LEADERBOARD: 'arena_leaderboard',
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]')
  } catch {
    return []
  }
}

export function saveSession(session) {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === session.id)
  if (idx !== -1) {
    sessions[idx] = session
  } else {
    sessions.unshift(session)
  }
  // Cap at 100 sessions
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 100)))
}

export function createSession({ prompt, responseA, responseB, verdict, modelA, modelB, userId }) {
  const session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    prompt,
    responseA,
    responseB,
    verdict,
    modelA: modelA || 'Mistral AI',
    modelB: modelB || 'Cohere AI',
    userId: userId || null,
    vote: null, // 'A' | 'B' | 'both_good' | 'both_bad'
    aiJudgement: verdict || null,
    createdAt: new Date().toISOString(),
  }
  saveSession(session)
  return session
}

export function updateSessionVote(sessionId, vote) {
  const sessions = getSessions()
  const session = sessions.find(s => s.id === sessionId)
  if (session) {
    session.vote = vote
    saveSession(session)
    updateLeaderboard(session, vote)
  }
}

export function getSessionById(id) {
  return getSessions().find(s => s.id === id) || null
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '{}')
  } catch {
    return {}
  }
}

function saveLeaderboard(lb) {
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(lb))
}

export function updateLeaderboard(session, vote) {
  const lb = getLeaderboard()
  const models = [session.modelA, session.modelB]

  // Ensure both models exist
  models.forEach(m => {
    if (!lb[m]) lb[m] = { name: m, wins: 0, losses: 0, ties: 0, total: 0 }
  })

  if (vote === 'A') {
    lb[session.modelA].wins++
    lb[session.modelB].losses++
  } else if (vote === 'B') {
    lb[session.modelB].wins++
    lb[session.modelA].losses++
  } else if (vote === 'both_good') {
    lb[session.modelA].ties++
    lb[session.modelB].ties++
  } else if (vote === 'both_bad') {
    lb[session.modelA].losses++
    lb[session.modelB].losses++
  }

  lb[session.modelA].total++
  lb[session.modelB].total++

  saveLeaderboard(lb)
}

export function getLeaderboardData() {
  const lb = getLeaderboard()
  return Object.values(lb)
    .map(m => ({
      ...m,
      winRate: m.total > 0 ? Math.round((m.wins / m.total) * 100) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
}

// Also record AI judge verdict wins
export function recordJudgeVerdict(session, winner) {
  const lb = getLeaderboard()
  const winnerModel = winner === 'A' ? session.modelA : session.modelB
  const loserModel = winner === 'A' ? session.modelB : session.modelA

  if (!lb[winnerModel]) lb[winnerModel] = { name: winnerModel, wins: 0, losses: 0, ties: 0, total: 0 }
  if (!lb[loserModel]) lb[loserModel] = { name: loserModel, wins: 0, losses: 0, ties: 0, total: 0 }

  lb[winnerModel].wins++
  lb[loserModel].losses++
  lb[winnerModel].total++
  lb[loserModel].total++

  saveLeaderboard(lb)
}
