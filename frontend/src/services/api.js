/**
 * api.js — Real API service connecting to the Express/LangGraph backend.
 * Calls POST /api/battle which runs Mistral + Cohere in parallel,
 * then uses Gemini to judge both responses.
 */

/**
 * runBattle — Sends a prompt to the backend and streams progress to the UI
 * via onProgress callbacks, then resolves with the full result.
 *
 * @param {string} prompt - The user's battle prompt
 * @param {Function} onProgress - Callback with { stage, responseA?, responseB?, verdict? }
 */
export const runBattle = async (prompt, onProgress) => {
  // Stage 1: Both models loading simultaneously
  onProgress({ stage: 'models_loading' })

  const response = await fetch('/api/battle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.details || err.error || `HTTP ${response.status}`)
  }

  const data = await response.json()
  // data = { solution_1, solution_2, judge: { solution_1_score, solution_2_score, solution_1_reasoning, solution_2_reasoning } }

  // Stage 2: Model A (Mistral) done
  onProgress({
    stage: 'model_a_done',
    responseA: {
      text: data.solution_1,
      score: data.judge.solution_1_score,
    },
  })

  // Stage 3: Model B (Cohere) done
  onProgress({
    stage: 'model_b_done',
    responseB: {
      text: data.solution_2,
      score: data.judge.solution_2_score,
    },
  })

  // Stage 4: Judge verdict
  const winner =
    data.judge.solution_1_score >= data.judge.solution_2_score ? 'A' : 'B'

  onProgress({
    stage: 'done',
    verdict: {
      winner,
      scoreA: data.judge.solution_1_score,
      scoreB: data.judge.solution_2_score,
      analysisA: data.judge.solution_1_reasoning,
      analysisB: data.judge.solution_2_reasoning,
      reason:
        winner === 'A'
          ? `Mistral scored ${data.judge.solution_1_score}/10 vs Cohere ${data.judge.solution_2_score}/10`
          : `Cohere scored ${data.judge.solution_2_score}/10 vs Mistral ${data.judge.solution_1_score}/10`,
    },
  })
}
