import { useState } from 'react'
import { Cpu, ChevronDown, ChevronUp, Loader2, Clock, Zap, TrendingUp, Sliders } from 'lucide-react'

const RoutingCard = ({ routing, model, reason, isLoading, loadingStep, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // With flat schema, all fields are directly on `routing` — no nested `.metrics`
  const modelVal = routing?.selected_model ?? routing?.model ?? model ?? 'N/A'

  const costVal =
    routing?.estimated_cost_usd !== undefined && routing?.estimated_cost_usd !== null
      ? `$${parseFloat(routing.estimated_cost_usd).toFixed(6)}`
      : 'N/A'

  const confidenceVal =
    routing?.confidence !== undefined && routing?.confidence !== null
      ? String(routing.confidence).includes('%')
        ? routing.confidence
        : `${routing.confidence}%`
      : 'N/A'

  // Format numeric confidence for radial/circular graphics
  const numericConfidence =
    confidenceVal !== 'N/A' ? parseInt(String(confidenceVal).replace('%', '')) || 0 : 0

  const reasonVal = routing?.routing_reason ?? routing?.reason ?? reason ?? 'N/A'

  // Calculate real savings percentage based on actual model cost vs expensive baseline (Gemini 1.5 Pro)
  let savingsVal = 'N/A'
  const totalTokens = routing?.total_tokens ?? 0
  if (totalTokens > 0) {
    const cost = routing?.estimated_cost_usd ?? 0
    const baselineCost = totalTokens * 0.000003 // Gemini 1.5 Pro baseline
    if (baselineCost > 0) {
      const pct = Math.max(
        0,
        Math.min(99, Math.round(((baselineCost - cost) / baselineCost) * 100))
      )
      savingsVal = `${pct}%`
    }
  } else {
    // If tokens are not provided, estimate based on model
    const m = modelVal.toLowerCase()
    if (m.includes('llama') || m.includes('groq')) {
      savingsVal = '77%'
    } else if (m.includes('gemini') || m.includes('flash')) {
      savingsVal = '98%'
    }
  }

  const speedVal = routing?.response_speed ?? 'N/A'

  const factorsVal = {
    intentMatch:
      routing?.intent_match !== undefined && routing?.intent_match !== null
        ? routing.intent_match
        : 'N/A',
    quality:
      routing?.response_quality !== undefined && routing?.response_quality !== null
        ? routing.response_quality
        : 'N/A',
    latency:
      routing?.latency_index !== undefined && routing?.latency_index !== null
        ? routing.latency_index
        : 'N/A',
    costEfficiency:
      routing?.cost_efficiency !== undefined && routing?.cost_efficiency !== null
        ? routing.cost_efficiency
        : 'N/A',
  }

  const detailsVal = {
    intent: routing?.intent
      ? routing.intent.charAt(0).toUpperCase() + routing.intent.slice(1)
      : 'N/A',
    contextLength:
      routing?.context_length !== undefined && routing?.context_length !== null
        ? `${routing.context_length} tokens`
        : 'N/A',
    provider: routing?.provider_entity ?? 'N/A',
    version: routing?.model_version ?? 'N/A',
    score:
      routing?.composite_score !== undefined && routing?.composite_score !== null
        ? `${routing.composite_score}/100`
        : 'N/A',
    fallbacks: routing?.fallbacks_evaluated ?? [],
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
  const strokeDashoffset =
    confidenceVal !== 'N/A' && confidenceVal !== ''
      ? circumference - (numericConfidence / 100) * circumference
      : circumference

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
        {confidenceVal !== '' && (
          <div className="flex items-center gap-2 bg-sidebar-bg border border-border-app py-1 px-2.5 rounded-lg select-none">
            <span className="text-[10px] text-secondary font-mono font-medium">Confidence:</span>
            {confidenceVal !== 'N/A' ? (
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
            ) : (
              <span className="text-[10px] font-bold font-mono text-primary">N/A</span>
            )}
          </div>
        )}
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
            <span className="font-mono text-[10px] text-primary">
              {factorsVal.intentMatch !== 'N/A' && factorsVal.intentMatch !== ''
                ? `${factorsVal.intentMatch}%`
                : 'N/A'}
            </span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width:
                  factorsVal.intentMatch !== 'N/A' && factorsVal.intentMatch !== ''
                    ? `${factorsVal.intentMatch}%`
                    : '0%',
              }}
            ></div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Response Quality</span>
            <span className="font-mono text-[10px] text-primary">
              {factorsVal.quality !== 'N/A' && factorsVal.quality !== ''
                ? `${factorsVal.quality}%`
                : 'N/A'}
            </span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full"
              style={{
                width:
                  factorsVal.quality !== 'N/A' && factorsVal.quality !== ''
                    ? `${factorsVal.quality}%`
                    : '0%',
              }}
            ></div>
          </div>
        </div>

        {/* Latency optimization */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Latency Index</span>
            <span className="font-mono text-[10px] text-primary">
              {factorsVal.latency !== 'N/A' && factorsVal.latency !== ''
                ? `${factorsVal.latency}%`
                : 'N/A'}
            </span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{
                width:
                  factorsVal.latency !== 'N/A' && factorsVal.latency !== ''
                    ? `${factorsVal.latency}%`
                    : '0%',
              }}
            ></div>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-secondary">
            <span>Cost Efficiency</span>
            <span className="font-mono text-[10px] text-primary">
              {factorsVal.costEfficiency !== 'N/A' && factorsVal.costEfficiency !== ''
                ? `${factorsVal.costEfficiency}%`
                : 'N/A'}
            </span>
          </div>
          <div className="h-1 bg-card-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{
                width:
                  factorsVal.costEfficiency !== 'N/A' && factorsVal.costEfficiency !== ''
                    ? `${factorsVal.costEfficiency}%`
                    : '0%',
              }}
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
            {savingsVal !== 'N/A' && savingsVal !== '' && <TrendingUp size={10} />}
            {savingsVal}
          </span>
        </div>

        {/* Speed Badge */}
        <div className="bg-sidebar-bg border border-border-app rounded-lg p-2 flex flex-col justify-center text-center">
          <span className="text-[9px] text-secondary font-mono uppercase tracking-wider mb-0.5">
            Response Speed
          </span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono flex items-center justify-center gap-0.5">
            {speedVal !== 'N/A' && speedVal !== '' && <Zap size={10} />}
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
              Provider
            </div>
            <div className="text-primary font-medium">{routing?.provider_entity ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Selected Model
            </div>
            <div
              className="text-primary font-mono font-medium truncate"
              title={routing?.selected_model ?? routing?.model ?? model ?? 'N/A'}
            >
              {routing?.selected_model ?? routing?.model ?? model ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Intent
            </div>
            <div className="text-primary font-medium">
              {routing?.intent
                ? routing.intent.charAt(0).toUpperCase() + routing.intent.slice(1)
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Routing Policy
            </div>
            <div className="text-primary font-medium">
              {routing?.routing_policy
                ? routing.routing_policy.charAt(0).toUpperCase() + routing.routing_policy.slice(1)
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Confidence
            </div>
            <div className="text-primary font-mono font-medium">{confidenceVal}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Latency
            </div>
            <div className="text-primary font-mono font-medium">
              {routing?.latency_ms !== undefined && routing?.latency_ms !== null
                ? `${parseFloat(routing.latency_ms).toFixed(0)} ms`
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Prompt Tokens
            </div>
            <div className="text-primary font-mono font-medium">
              {routing?.prompt_tokens !== undefined && routing?.prompt_tokens !== null
                ? routing.prompt_tokens
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Completion Tokens
            </div>
            <div className="text-primary font-mono font-medium">
              {routing?.completion_tokens !== undefined && routing?.completion_tokens !== null
                ? routing.completion_tokens
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Total Tokens
            </div>
            <div className="text-primary font-mono font-medium">
              {routing?.total_tokens !== undefined && routing?.total_tokens !== null
                ? routing.total_tokens
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Estimated Cost
            </div>
            <div className="text-primary font-mono font-medium">{costVal}</div>
          </div>
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Fallback Used
            </div>
            <div className="text-primary font-medium">
              {routing?.fallback_used !== undefined && routing?.fallback_used !== null
                ? routing.fallback_used
                  ? 'Yes'
                  : 'No'
                : 'N/A'}
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
          <div className="col-span-2 pt-1 border-t border-border-app/30">
            <div className="text-neutral-600 dark:text-neutral-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">
              Reason
            </div>
            <div className="text-primary leading-normal text-xs select-text">{reasonVal}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutingCard
