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
export function getMockRouting(query, file = null, policy = 'balanced') {
  const q = query.toLowerCase()

  // 1. MAX ACCURACY POLICY OVERRIDES
  if (policy === 'accuracy') {
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
      if (isImage) {
        return {
          model: 'GPT-4o',
          confidence: '99%',
          cost: '$0.0032',
          reason: `Max Accuracy Policy: Forced GPT-4o high-precision Vision encoder for processing visual payload "${file.name}".`,
          latency: '~1.3s',
        }
      }
      return {
        model: 'Gemini 1.5 Pro',
        confidence: '98%',
        cost: '$0.0035',
        reason: `Max Accuracy Policy: Routed "${file.name}" to Gemini 1.5 Pro (tier-1 2M tokens context payload indexing).`,
        latency: '~1.7s',
      }
    }

    if (
      q.includes('code') ||
      q.includes('function') ||
      q.includes('debug') ||
      q.includes('react') ||
      q.includes('python') ||
      q.includes('javascript') ||
      q.includes('rust') ||
      q.includes('typescript') ||
      q.includes('api') ||
      q.includes('component') ||
      q.includes('script') ||
      q.includes('write a')
    ) {
      return {
        model: 'Claude 3.5 Sonnet',
        confidence: '99%',
        cost: '$0.0048',
        reason:
          'Max Accuracy Policy: Forced Claude 3.5 Sonnet for maximum semantic and code syntax debugging benchmarks.',
        latency: '~1.2s',
      }
    }

    if (
      q.includes('search') ||
      q.includes('latest') ||
      q.includes('news') ||
      q.includes('research') ||
      q.includes('find') ||
      q.includes('who is') ||
      q.includes('what is the') ||
      q.includes('current') ||
      q.includes('today')
    ) {
      return {
        model: 'Perplexity Sonar Pro',
        confidence: '97%',
        cost: '$0.0030',
        reason:
          'Max Accuracy Policy: Forced Perplexity Sonar Pro for deep web queries with extensive citations.',
        latency: '~1.5s',
      }
    }

    // Default premium accuracy model
    return {
      model: 'GPT-4o',
      confidence: '98%',
      cost: '$0.0028',
      reason:
        'Max Accuracy Policy: Defaulting to GPT-4o for primary tier-1 conversational and reasoning depth.',
      latency: '~1.0s',
    }
  }

  // 2. COST OPTIMIZER POLICY OVERRIDES
  if (policy === 'cost') {
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
      if (isImage) {
        return {
          model: 'Gemini 1.5 Flash',
          confidence: '92%',
          cost: '$0.00008',
          reason: `Cost Optimizer Policy: Routed image "${file.name}" to Gemini 1.5 Flash to save 97% on token processing costs.`,
          latency: '~0.6s',
        }
      }
      return {
        model: 'Gemini 1.5 Flash',
        confidence: '90%',
        cost: '$0.00008',
        reason: `Cost Optimizer Policy: Routed document "${file.name}" to Gemini 1.5 Flash to index long-context context cheaply.`,
        latency: '~0.8s',
      }
    }

    if (
      q.includes('code') ||
      q.includes('function') ||
      q.includes('debug') ||
      q.includes('react') ||
      q.includes('python') ||
      q.includes('javascript') ||
      q.includes('rust') ||
      q.includes('typescript') ||
      q.includes('api') ||
      q.includes('component') ||
      q.includes('script') ||
      q.includes('write a')
    ) {
      return {
        model: 'DeepSeek Coder',
        confidence: '94%',
        cost: '$0.0002',
        reason:
          'Cost Optimizer Policy: Routed to DeepSeek Coder to resolve code prompts at a fraction of standard API prices.',
        latency: '~1.0s',
      }
    }

    if (
      q.includes('search') ||
      q.includes('latest') ||
      q.includes('news') ||
      q.includes('research') ||
      q.includes('find') ||
      q.includes('who is') ||
      q.includes('what is the') ||
      q.includes('current') ||
      q.includes('today')
    ) {
      return {
        model: 'Perplexity Sonar',
        confidence: '93%',
        cost: '$0.0005',
        reason:
          'Cost Optimizer Policy: Selected basic Perplexity Sonar node to save 80% on live factual routing.',
        latency: '~0.8s',
      }
    }

    // Default cost-efficient model
    return {
      model: 'GPT-4o-mini',
      confidence: '92%',
      cost: '$0.00015',
      reason:
        'Cost Optimizer Policy: Routed to GPT-4o-mini for general chat query to maximize cost-efficiency.',
      latency: '~0.5s',
    }
  }

  // 3. BALANCED POLICY (DEFAULT ROUTEMIND HEURISTICS)

  if (file) {
    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)

    if (isImage) {
      return {
        model: 'GPT-4o',
        confidence: '98%',
        cost: '$0.0032',
        reason: `Routed to GPT-4o Vision layer to parse spatial features and pixel layouts in "${file.name}" with sub-pixel alignment.`,
        latency: '~1.4s',
      }
    }

    if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) {
      return {
        model: 'Gemini 1.5 Pro',
        confidence: '97%',
        cost: '$0.0015',
        reason: `Routed to Gemini 1.5 Pro because the payload "${file.name}" requires long-context window ingestion and token semantic indexing.`,
        latency: '~1.8s',
      }
    }
  }

  if (
    q.includes('code') ||
    q.includes('function') ||
    q.includes('debug') ||
    q.includes('react') ||
    q.includes('python') ||
    q.includes('javascript') ||
    q.includes('rust') ||
    q.includes('typescript') ||
    q.includes('api') ||
    q.includes('component') ||
    q.includes('script') ||
    q.includes('write a')
  ) {
    return {
      model: 'Claude 3.5 Sonnet',
      confidence: '99%',
      cost: '$0.0048',
      reason:
        'Claude 3.5 Sonnet leads on coding benchmarks (SWE-Bench 49%), precise instruction-following, and handling complex multi-file logic.',
      latency: '~1.2s',
    }
  }

  if (
    q.includes('search') ||
    q.includes('latest') ||
    q.includes('news') ||
    q.includes('research') ||
    q.includes('find') ||
    q.includes('who is') ||
    q.includes('what is the') ||
    q.includes('current') ||
    q.includes('today')
  ) {
    return {
      model: 'Perplexity Sonar',
      confidence: '97%',
      cost: '$0.0012',
      reason:
        'Perplexity Sonar has real-time web access and is optimised for factual retrieval with source citations.',
      latency: '~0.9s',
    }
  }

  if (
    q.includes('pdf') ||
    q.includes('document') ||
    q.includes('summarize') ||
    q.includes('image') ||
    q.includes('analyse') ||
    q.includes('analyze') ||
    q.includes('vision') ||
    q.includes('chart') ||
    q.includes('table')
  ) {
    return {
      model: 'Gemini 1.5 Pro',
      confidence: '96%',
      cost: '$0.0035',
      reason:
        'Gemini 1.5 Pro has a 1M-token context window and native multimodal support, ideal for long documents and images.',
      latency: '~1.5s',
    }
  }

  if (
    q.includes('reason') ||
    q.includes('logic') ||
    q.includes('math') ||
    q.includes('proof') ||
    q.includes('solve') ||
    q.includes('calculate') ||
    q.includes('equation') ||
    q.includes('step by step')
  ) {
    return {
      model: 'o3-mini',
      confidence: '98%',
      cost: '$0.0022',
      reason:
        'o3-mini is optimised for multi-step reasoning and mathematical problem solving with high accuracy.',
      latency: '~2.1s',
    }
  }

  // Default fallback
  return {
    model: 'GPT-4o',
    confidence: '95%',
    cost: '$0.0028',
    reason:
      'GPT-4o is a strong general-purpose model with balanced performance across writing, Q&A, and conversation.',
    latency: '~1.0s',
  }
}
