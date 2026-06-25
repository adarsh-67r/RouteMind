import { useState } from 'react'
import {
  Cpu,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Zap,
  TrendingUp,
  Sliders,
  History,
  MessageSquare,
} from 'lucide-react'

const RoutingCard = ({
  routing,
  model,
  cost,
  savings,
  speed,
  confidence,
  reason,
  factors,
  details,
  isLoading,
  loadingStep,
  timestamp,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract props with defaults, giving precedence to fields nested in `routing` prop
  const modelVal = routing?.selected_model ?? routing?.model ?? model ?? 'GPT-4o'

  const costVal =
    routing?.estimated_cost !== undefined
      ? `$${parseFloat(routing.estimated_cost).toFixed(6)}`
      : (routing?.cost ?? cost ?? '$0.003')

  const confidenceVal =
    routing?.confidence !== undefined
      ? String(routing.confidence).includes('%')
        ? routing.confidence
        : `${routing.confidence}%`
      : (routing?.confidence ?? confidence ?? '92%')

  // Format numeric confidence for radial/circular graphics
  const numericConfidence = parseInt(String(confidenceVal).replace('%', '')) || 92

  const reasonVal =
    routing?.reason ??
    reason ??
    `Routed to ${modelVal} as cost constraints and query latency are balanced for optimal performance.`

  // Dynamically derive stats/details based on the selected model if not provided
  let defaultSpeed = 'Fast'
  let defaultSavings = '68%'
  let defaultFactors = { intentMatch: 95, quality: 92, latency: 87, costEfficiency: 89 }
  let defaultDetails = {
    intent: 'General Reasoning',
    provider: 'OpenAI API',
    version: 'gpt-4o-2024-05-13',
    contextLength: '128k tokens',
    score: '95/100',
    fallbacks: ['Claude 3.5 Sonnet', 'Gemini 1.5 Pro'],
  }

  if (modelVal.includes('Sonnet') || modelVal.includes('Claude')) {
    defaultSpeed = 'Moderate'
    defaultSavings = '62%'
    defaultFactors = { intentMatch: 99, quality: 98, latency: 85, costEfficiency: 70 }
    defaultDetails = {
      intent: 'Coding & Complex Logic',
      provider: 'Anthropic API',
      version: 'claude-3-5-sonnet-20240620',
      contextLength: '200k tokens',
      score: '99/100',
      fallbacks: ['GPT-4o', 'Gemini 1.5 Pro'],
    }
  } else if (modelVal.includes('Gemini 1.5 Pro')) {
    defaultSpeed = 'Moderate'
    defaultSavings = '82%'
    defaultFactors = { intentMatch: 98, quality: 95, latency: 78, costEfficiency: 85 }
    defaultDetails = {
      intent: 'Document & Long-Context',
      provider: 'Google Vertex AI',
      version: 'gemini-1.5-pro-001',
      contextLength: '2M tokens',
      score: '97/100',
      fallbacks: ['GPT-4o', 'Claude 3.5 Sonnet'],
    }
  } else if (modelVal.includes('Flash')) {
    defaultSpeed = 'Ultra Fast'
    defaultSavings = '95%'
    defaultFactors = { intentMatch: 92, quality: 90, latency: 97, costEfficiency: 98 }
    defaultDetails = {
      intent: 'Low Latency Retrieval',
      provider: 'Google Vertex AI',
      version: 'gemini-1.5-flash-001',
      contextLength: '1M tokens',
      score: '92/100',
      fallbacks: ['GPT-4o-mini', 'Llama 3.1'],
    }
  } else if (modelVal.includes('mini') || modelVal.includes('Mini')) {
    defaultSpeed = 'Very Fast'
    defaultSavings = '90%'
    defaultFactors = { intentMatch: 93, quality: 89, latency: 95, costEfficiency: 96 }
    defaultDetails = {
      intent: 'Conversational Utility',
      provider: 'OpenAI API',
      version: 'gpt-4o-mini-2024-07-18',
      contextLength: '128k tokens',
      score: '91/100',
      fallbacks: ['Gemini 1.5 Flash', 'Llama 3.1'],
    }
  } else if (modelVal.includes('DeepSeek')) {
    defaultSpeed = 'Fast'
    defaultSavings = '92%'
    defaultFactors = { intentMatch: 94, quality: 93, latency: 88, costEfficiency: 95 }
    defaultDetails = {
      intent: 'Coding & Math Optimization',
      provider: 'DeepSeek Edge',
      version: 'deepseek-coder-v2',
      contextLength: '64k tokens',
      score: '94/100',
      fallbacks: ['Claude 3.5 Sonnet', 'GPT-4o-mini'],
    }
  } else if (modelVal.includes('Sonar') || modelVal.includes('Perplexity')) {
    defaultSpeed = 'Fast'
    defaultSavings = '75%'
    defaultFactors = { intentMatch: 97, quality: 94, latency: 91, costEfficiency: 88 }
    defaultDetails = {
      intent: 'Live Search & Synthesis',
      provider: 'Perplexity API',
      version: 'sonar-pro-2024',
      contextLength: '32k tokens',
      score: '96/100',
      fallbacks: ['GPT-4o', 'Gemini 1.5 Flash'],
    }
  } else if (modelVal.includes('o3-mini')) {
    defaultSpeed = 'Moderate'
    defaultSavings = '78%'
    defaultFactors = { intentMatch: 99, quality: 97, latency: 74, costEfficiency: 82 }
    defaultDetails = {
      intent: 'Advanced Reasoning & Math',
      provider: 'OpenAI API',
      version: 'o3-mini-2025-01',
      contextLength: '200k tokens',
      score: '98/100',
      fallbacks: ['Claude 3.5 Sonnet', 'GPT-4o'],
    }
  }

  const savingsVal = routing?.savings ?? savings ?? defaultSavings
  const speedVal = routing?.speed ?? speed ?? defaultSpeed
  const factorsVal = routing?.factors ?? factors ?? defaultFactors
  const detailsVal = { ...(routing?.details ?? details ?? defaultDetails) }

  if (routing?.intent) {
    detailsVal.intent = routing.intent.charAt(0).toUpperCase() + routing.intent.slice(1)
  }
  if (routing?.provider) {
    detailsVal.provider = routing.provider.toUpperCase()
  }

  const isLoadingVal = routing?.isLoading ?? isLoading ?? false
  const loadingStepVal = routing?.loadingStep ?? loadingStep ?? 'Analyzing Request Intent...'

  const timestampVal =
    routing?.timestamp ??
    timestamp ??
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Confidence ring math
  const radius = 14
  const stroke = 2.5
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (numericConfidence / 100) * circumference

  // Circular Confidence indicator colors based on score
  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-[#22C55E]' // Success Green
    if (score >= 70) return 'text-[#F59E0B]' // Warning Orange
    return 'text-[#EF4444]' // Danger Red
  }

  // Loader state rendering
  if (isLoadingVal) {
    return (
      <div className="w-full max-w-[500px] bg-card-bg border border-border-app rounded-xl p-4 shadow-md select-none text-left">
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-semibold text-primary font-mono tracking-wider uppercase">
              RouteMind Routing...
            </div>
            <div className="text-[11px] text-secondary flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {loadingStepVal}
            </div>
          </div>
        </div>

        {/* Subtle running progress track */}
        <div className="mt-3.5 h-1 w-full bg-sidebar-bg rounded-full overflow-hidden border border-border-app/40">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-[loading-bar_1.5s_infinite_linear]"
            style={{ width: '40%' }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[500px] bg-card-bg border border-border-app rounded-xl p-4 shadow-sm select-none text-left transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-lg group/card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-app/60 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-950/30 border border-blue-500/10 text-blue-400">
            <Sliders
              size={12}
              className="group-hover/card:rotate-45 transition-transform duration-300"
            />
          </div>
          <span className="text-[11px] font-semibold text-primary tracking-wider uppercase font-mono">
            RouteMind Decision
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-secondary font-mono">
          <Clock size={10} className="text-neutral-500" />
          <span>{timestampVal}</span>
        </div>
      </div>

      {/* Primary Row: Model and Confidence */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sidebar-bg border border-border-app text-blue-600 dark:text-blue-400 font-semibold font-mono text-xs select-none">
            <Cpu size={12} className="text-blue-500" />
            <span>{modelVal}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sidebar-bg/60 text-secondary font-mono border border-border-app/40">
            Active Node
          </span>
        </div>

        {/* Confidence Ring Indicator */}
        <div className="flex items-center gap-2 bg-sidebar-bg border border-border-app py-1 px-2.5 rounded-lg select-none">
          <span className="text-[10px] text-secondary font-mono font-medium">Confidence:</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                className="text-border-app"
                strokeWidth={stroke}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={16}
                cy={16}
              />
              <circle
                className={`${getConfidenceColor(numericConfidence)} transition-all duration-300`}
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx={16}
                cy={16}
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-primary">
              {numericConfidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Reason Description */}
      <div className="text-xs text-secondary leading-relaxed mb-4 select-text">{reasonVal}</div>

      {/* Scoring Factor Bars */}
      <div className="space-y-2 mb-4 bg-sidebar-bg border border-border-app/40 rounded-lg p-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-600 dark:text-neutral-400 mb-1">
          <span className="uppercase tracking-wider">Evaluation Factors</span>
          <span>Proximal Score</span>
        </div>

        {/* Intent Match */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Intent Match</span>
            <span className="font-mono text-[10px] text-primary">{factorsVal.intentMatch}%</span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${factorsVal.intentMatch}%` }}
            ></div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Response Quality</span>
            <span className="font-mono text-[10px] text-primary">{factorsVal.quality}%</span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full"
              style={{ width: `${factorsVal.quality}%` }}
            ></div>
          </div>
        </div>

        {/* Latency optimization */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Latency Index</span>
            <span className="font-mono text-[10px] text-primary">{factorsVal.latency}%</span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${factorsVal.latency}%` }}
            ></div>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Cost Efficiency</span>
            <span className="font-mono text-[10px] text-primary">{factorsVal.costEfficiency}%</span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${factorsVal.costEfficiency}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Optimization Summary Badges */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Cost Badge */}
        <div className="bg-sidebar-bg border border-border-app rounded-lg p-2 flex flex-col justify-center text-center">
          <span className="text-[9px] text-secondary font-mono uppercase tracking-wider mb-0.5">
            Expected Cost
          </span>
          <span className="text-[11px] font-semibold text-primary font-mono">{costVal}</span>
        </div>

        {/* Savings Badge */}
        <div className="bg-sidebar-bg border border-border-app rounded-lg p-2 flex flex-col justify-center text-center">
          <span className="text-[9px] text-secondary font-mono uppercase tracking-wider mb-0.5">
            Est. Savings
          </span>
          <span className="text-[11px] font-semibold text-[#22C55E] font-mono flex items-center justify-center gap-0.5">
            <TrendingUp size={10} />
            {savingsVal}
          </span>
        </div>

        {/* Speed Badge */}
        <div className="bg-sidebar-bg border border-border-app rounded-lg p-2 flex flex-col justify-center text-center">
          <span className="text-[9px] text-secondary font-mono uppercase tracking-wider mb-0.5">
            Response Speed
          </span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono flex items-center justify-center gap-0.5">
            <Zap size={10} />
            {speedVal}
          </span>
        </div>
      </div>

      {/* Toggle Accordion */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1.5 flex items-center justify-center gap-1 rounded bg-sidebar-bg/40 hover:bg-sidebar-bg border border-border-app text-[10px] font-semibold text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
        aria-expanded={isExpanded}
        aria-label="Toggle Decision Details"
      >
        <span>{isExpanded ? 'Hide Decision Details' : 'View Decision Details'}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expanded transition area */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-border-app/80 grid grid-cols-2 gap-x-4 gap-y-3.5 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Intent Category
            </div>
            <div className="text-primary font-medium">{detailsVal.intent}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Context Length
            </div>
            <div className="text-primary font-mono font-medium">{detailsVal.contextLength}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Provider Entity
            </div>
            <div className="text-primary font-medium">{detailsVal.provider}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Model Version
            </div>
            <div className="text-primary font-mono font-medium truncate" title={detailsVal.version}>
              {detailsVal.version}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Composite Score
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
              {detailsVal.score}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Fallbacks Evaluated
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {detailsVal.fallbacks.map((fallback, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-sidebar-bg border border-border-app text-[9px] font-mono text-secondary"
                >
                  {fallback}
                </span>
              ))}
            </div>
          </div>

          {/* FUTURE-READY ARCHITECTURAL PLACEHOLDERS */}
          {/* Token details context slot */}
          <div className="col-span-2 pt-2 border-t border-border-app/30 grid grid-cols-3 gap-2 opacity-50 text-[10px] select-none pointer-events-none">
            <div className="flex items-center gap-1 text-neutral-500">
              <ShieldCheck size={10} />
              <span>Token Usage Architecture Ready</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <History size={10} />
              <span>Historical stats ready</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500 font-sans">
              <MessageSquare size={10} />
              <span>Feedback hooks ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutingCard
