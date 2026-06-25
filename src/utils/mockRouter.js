/**
 * getMockRouting
 *
 * Extracted from Chat.jsx's handleSendMessage so it can be:
 *   1. Unit-tested independently
 *   2. Swapped out for a real API call later without touching UI code
 *
 * @param {string} query - The user's raw input string
 * @returns {{ model: string, confidence: string, cost: string, reason: string, latency: string }}
 */
export function getMockRouting(query, file = null) {
  const q = query.toLowerCase()

  if (file) {
    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
    
    if (isImage) {
      return {
        model: 'GPT-4o',
        confidence: '98%',
        cost: '$0.0032',
        reason: `Routed to GPT-4o Vision layer to parse spatial features and pixel layouts in "${file.name}" with sub-pixel alignment.`,
        latency: '~1.4s'
      }
    }
    
    if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) {
      return {
        model: 'Gemini 1.5 Pro',
        confidence: '97%',
        cost: '$0.0015',
        reason: `Routed to Gemini 1.5 Pro because the payload "${file.name}" requires long-context window ingestion and token semantic indexing.`,
        latency: '~1.8s'
      }
    }
  }

  if (
    q.includes('code') || q.includes('function') || q.includes('debug') ||
    q.includes('react') || q.includes('python') || q.includes('javascript') ||
    q.includes('rust') || q.includes('typescript') || q.includes('api') ||
    q.includes('component') || q.includes('script') || q.includes('write a')
  ) {
    return {
      model: 'Claude 3.5 Sonnet',
      confidence: '99%',
      cost: '$0.0048',
      reason: 'Claude 3.5 Sonnet leads on coding benchmarks (SWE-Bench 49%), precise instruction-following, and handling complex multi-file logic.',
      latency: '~1.2s',
    }
  }

  if (
    q.includes('search') || q.includes('latest') || q.includes('news') ||
    q.includes('research') || q.includes('find') || q.includes('who is') ||
    q.includes('what is the') || q.includes('current') || q.includes('today')
  ) {
    return {
      model: 'Perplexity Sonar',
      confidence: '97%',
      cost: '$0.0012',
      reason: 'Perplexity Sonar has real-time web access and is optimised for factual retrieval with source citations.',
      latency: '~0.9s',
    }
  }

  if (
    q.includes('pdf') || q.includes('document') || q.includes('summarize') ||
    q.includes('image') || q.includes('analyse') || q.includes('analyze') ||
    q.includes('vision') || q.includes('chart') || q.includes('table')
  ) {
    return {
      model: 'Gemini 1.5 Pro',
      confidence: '96%',
      cost: '$0.0035',
      reason: 'Gemini 1.5 Pro has a 1M-token context window and native multimodal support, ideal for long documents and images.',
      latency: '~1.5s',
    }
  }

  if (
    q.includes('reason') || q.includes('logic') || q.includes('math') ||
    q.includes('proof') || q.includes('solve') || q.includes('calculate') ||
    q.includes('equation') || q.includes('step by step')
  ) {
    return {
      model: 'o3-mini',
      confidence: '98%',
      cost: '$0.0022',
      reason: 'o3-mini is optimised for multi-step reasoning and mathematical problem solving with high accuracy.',
      latency: '~2.1s',
    }
  }

  // Default fallback
  return {
    model: 'GPT-4o',
    confidence: '95%',
    cost: '$0.0028',
    reason: 'GPT-4o is a strong general-purpose model with balanced performance across writing, Q&A, and conversation.',
    latency: '~1.0s',
  }
}
