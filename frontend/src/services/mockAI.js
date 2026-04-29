/**
 * mockAI.js — Simulated AI responses for demonstration.
 * Replace these functions with real API calls (OpenAI, Gemini, etc.)
 */

const RESPONSES_A = [
  {
    text: `Here's a clean, production-ready implementation:

\`\`\`python
import numpy as np

class NeuralOptimizer:
    """Kinetic-aware neural network optimizer."""
    
    def __init__(self, learning_rate=0.001, mass=1.0):
        self.lr = learning_rate
        self.mass = mass
        self.velocity = {}
    
    def kinetic_loss(self, weights, grads):
        velocity = grads / self.mass
        kinetic_energy = 0.5 * self.mass * (velocity ** 2)
        return kinetic_energy.mean()
    
    def step(self, model, x, y):
        grads = model.compute_gradients(x, y)
        loss = self.kinetic_loss(model.weights, grads)
        model.update_weights(grads, custom_loss=loss)
        return loss
\`\`\`

This implementation uses physical kinetic energy principles to regularize gradient updates, improving convergence stability. The mass parameter controls the inertia of weight updates.`,
    tokens: '10/10',
  },
  {
    text: `Here's an efficient solution using modern patterns:

\`\`\`javascript
import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setStatus('connected');
    ws.current.onmessage = (e) => {
      setMessages(prev => [...prev, JSON.parse(e.data)]);
    };
    ws.current.onclose = () => setStatus('disconnected');
    return () => ws.current?.close();
  }, [url]);

  const send = (data) => ws.current?.send(JSON.stringify(data));
  return { messages, status, send };
};
\`\`\`

This custom hook manages WebSocket lifecycle with automatic cleanup, type-safe message handling, and real-time status tracking.`,
    tokens: '9/10',
  },
  {
    text: `My approach prioritizes correctness and clarity:

The key insight here is that we need to balance between time complexity and space complexity. Using a two-pointer sliding window technique:

\`\`\`python
def max_subarray_product(nums: list[int]) -> int:
    if not nums:
        return 0
    
    max_prod = min_prod = result = nums[0]
    
    for n in nums[1:]:
        candidates = (n, max_prod * n, min_prod * n)
        max_prod = max(candidates)
        min_prod = min(candidates)
        result = max(result, max_prod)
    
    return result
\`\`\`

Time: O(n), Space: O(1). This handles negative numbers elegantly by tracking both min and max products at each position.`,
    tokens: '10/10',
  },
  {
    text: `I'll provide a comprehensive, well-structured response:

The problem requires careful consideration of edge cases. Here's my solution:

\`\`\`typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delay = 1000
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return { data: await res.json(), error: null, loading: false };
    } catch (err) {
      if (attempt === retries - 1) {
        return { data: null, error: String(err), loading: false };
      }
      await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    }
  }
  return { data: null, error: 'Max retries exceeded', loading: false };
}
\`\`\`

This provides exponential backoff and proper TypeScript generics for type-safe API handling.`,
    tokens: '10/10',
  },
]

const RESPONSES_B = [
  {
    text: `Here is a simpler approach to custom loss functions in Python for neural network optimization:

\`\`\`python
import numpy as np

class Optimizer:
    def __init__(self, learning_rate):
        self.lr = learning_rate
    
    def optimize(self, params, grads):
        return params - self.lr * grads
\`\`\`

This provides a basic optimizer skeleton. While functional, it doesn't incorporate the specific kinetic energy loss requested. The implementation works as a standard gradient descent optimizer.`,
    tokens: '8/10',
  },
  {
    text: `A simpler WebSocket implementation:

\`\`\`javascript
function connectWebSocket(url, onMessage) {
  const ws = new WebSocket(url);
  ws.onmessage = (e) => onMessage(e.data);
  ws.onerror = (e) => console.error('WS Error', e);
  return ws;
}

// Usage
const socket = connectWebSocket('ws://localhost:8080', (msg) => {
  console.log('Received:', msg);
});
\`\`\`

This is a straightforward WebSocket wrapper. Note: no cleanup handling or React lifecycle integration is included.`,
    tokens: '7/10',
  },
  {
    text: `Here's my solution to the problem:

\`\`\`python
def max_product(nums):
    result = max(nums)
    cur_min = 1
    cur_max = 1
    
    for n in nums:
        tmp = cur_max * n
        cur_max = max(n, tmp, cur_min * n)
        cur_min = min(n, tmp, cur_min * n)
        result = max(result, cur_max)
    
    return result
\`\`\`

This should work for most cases. There might be some edge cases with zeros that need additional handling.`,
    tokens: '7/10',
  },
  {
    text: `Here's a fetch utility function:

\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
\`\`\`

Simple fetch wrapper with basic error handling. Does not include retry logic or loading states.`,
    tokens: '6/10',
  },
]

const VERDICTS = [
  {
    winner: 'A',
    analysisA: 'Model A demonstrated superior understanding of the prompt, implementing a physically-accurate kinetic energy calculation for backpropagation updates. The code is efficient, well-documented, and utilizes sophisticated mathematical principles required for high-end AI research.',
    analysisB: 'Model B provided a generic optimizer skeleton that failed to incorporate the specific "kinetic energy" loss request. While functionally correct as a basic optimizer, it lacked the depth and specialization requested by the prompt.',
    reason: 'Unanimous Decision — Superior structural logic & domain accuracy',
  },
  {
    winner: 'A',
    analysisA: 'Model A delivered a production-ready React custom hook with full lifecycle management, TypeScript-compatible patterns, real-time status tracking, and automatic cleanup. Handles all edge cases elegantly.',
    analysisB: 'Model B provided a utility function without React integration, missing the lifecycle cleanup that causes memory leaks in React applications. Lacks status management and type safety.',
    reason: 'Clear Victory — React best practices and production readiness',
  },
  {
    winner: 'A',
    analysisA: 'Model A provided a clean O(n) solution with O(1) space using a well-known algorithm. The explanation of tracking both min and max products to handle negatives demonstrates deep algorithmic understanding.',
    analysisB: 'Model B\'s solution is functionally similar but contains a subtle bug with the temporary variable assignment order, and the acknowledgment of potential edge cases signals reduced confidence in the solution.',
    reason: 'Model A Wins — Bug-free implementation with superior explanation',
  },
  {
    winner: 'A',
    analysisA: 'Model A went above and beyond with TypeScript generics, exponential backoff retry logic, and a well-structured response interface. This is production-grade code ready for enterprise deployment.',
    analysisB: 'Model B produced a minimal fetch wrapper lacking retry logic, loading state management, and type safety. Suitable only for simple demos, not production environments.',
    reason: 'Decisive Victory — Enterprise-grade vs demo-grade implementation',
  },
]

let responseIndex = 0

export const simulateBattle = async (prompt, onProgress) => {
  const idx = responseIndex % RESPONSES_A.length
  responseIndex++

  // Simulate Model A streaming
  onProgress({ stage: 'model_a_loading' })
  await delay(800 + Math.random() * 400)

  onProgress({ stage: 'model_a_done', responseA: RESPONSES_A[idx] })

  // Simulate Model B streaming
  onProgress({ stage: 'model_b_loading' })
  await delay(600 + Math.random() * 400)

  onProgress({ stage: 'model_b_done', responseB: RESPONSES_B[idx] })

  // Simulate Judge
  onProgress({ stage: 'judge_loading' })
  await delay(1000 + Math.random() * 500)

  onProgress({ stage: 'done', verdict: VERDICTS[idx] })
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
