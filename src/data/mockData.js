// Centralized mock data consumed across RouteMind components

export const MODEL_CANDIDATES = [
  'GPT-4o',
  'Claude 3.5 Sonnet',
  'Gemini 1.5 Flash',
  'DeepSeek Coder',
  'Llama 3.1',
]

export const ROUTING_STAGES = [
  { id: 'intent', label: 'Analyzing Query Structure' },
  { id: 'compare', label: 'Comparing Available Models' },
  { id: 'cost', label: 'Calculating Routing Score' },
  { id: 'provider', label: 'Selecting Optimal Provider' },
  { id: 'generate', label: 'Generating Response' },
]

export const TERMINAL_EXAMPLES = [
  {
    prompt: 'Debug my React state management synchronization error.',
    steps: [
      'Analyzing Intent Structures...',
      'Comparing Inference Models...',
      'Evaluating Memory & Costs...',
    ],
    selectedModel: 'Claude 3.5 Sonnet',
    reason:
      'Routed to Claude 3.5 Sonnet due to unmatched React 19 architecture reasoning and code repair accuracy.',
    cost: '$0.0048',
    savings: '62%',
  },
  {
    prompt: 'Summarize the attention mechanism in this 80-page transformers PDF.',
    steps: [
      'Analyzing Intent Structures...',
      'Measuring Context Payload...',
      'Evaluating Edge Node Latency...',
    ],
    selectedModel: 'Gemini 1.5 Pro',
    reason:
      'Routed to Gemini 1.5 Pro due to 2M token long-context payload capabilities and high semantic retrieval rates.',
    cost: '$0.0015',
    savings: '82%',
  },
  {
    prompt: 'Draft a short, punchy product update tweet for RouteMind v2 launch.',
    steps: [
      'Analyzing Intent Structures...',
      'Comparing Inference Models...',
      'Calculating Token Budget...',
    ],
    selectedModel: 'GPT-4o',
    reason:
      'Routed to GPT-4o for optimal speed, balanced creative copywriting syntax, and cost-efficient edge processing.',
    cost: '$0.0022',
    savings: '74%',
  },
]

export const defaultStats = {
  totalQueries: 14,
  savings: 0.85,
  models: {
    'GPT-4o': 5,
    'GPT-4o-mini': 1,
    'Claude 3.5 Sonnet': 3,
    'Gemini 1.5 Pro': 3,
    'Gemini 1.5 Flash': 1,
    'DeepSeek Coder': 1,
  },
}
