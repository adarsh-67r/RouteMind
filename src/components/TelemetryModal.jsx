import { useEffect } from 'react'
import { X, Activity } from 'lucide-react'

/**
 * TelemetryModal — Live routing telemetry dashboard.
 * Fixed header + scrollable body + fixed footer.
 * All values truncate/wrap gracefully at any sidebar width.
 */
const TelemetryModal = ({ isOpen, onClose, stats }) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const models = stats?.models ?? {}
  const totalQueries = stats?.totalQueries ?? 0
  const savings = stats?.savings ?? 0
  const avgOverhead = stats?.avgOverhead

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-sidebar-bg border border-border-app rounded-t-xl sm:rounded-xl w-full sm:max-w-md shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="telemetry-title"
      >
        {/* Fixed header */}
        <div className="px-4 py-3.5 border-b border-border-app flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Activity size={16} className="text-blue-500 shrink-0" />
            <h3 id="telemetry-title" className="text-sm font-semibold text-primary truncate">
              Live Routing Telemetry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-neutral-800 transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          <div className="p-4 space-y-4 text-xs">
            {/* Stats row — each card clips its value, never overflows */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total Routed', value: String(totalQueries), color: 'text-primary' },
                { label: 'Est. Savings', value: `$${savings.toFixed(3)}`, color: 'text-green-500' },
                {
                  label: 'Overhead',
                  value: avgOverhead ? `${Math.round(avgOverhead)}ms` : '<12ms',
                  color: 'text-blue-400',
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-2.5 bg-card-bg border border-border-app rounded-lg text-center overflow-hidden"
                >
                  <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider mb-1 leading-tight">
                    {label}
                  </p>
                  <p className={`text-base font-bold font-mono ${color} truncate`} title={value}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Model utilization */}
            <div className="bg-card-bg border border-border-app rounded-lg p-3.5 space-y-3">
              <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                Model Utilization Distribution
              </h4>
              {Object.keys(models).length === 0 ? (
                <p className="text-[11px] text-neutral-600 font-mono text-center py-3">
                  No data yet — send a message to see routing stats.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(models).map(([modelName, count]) => {
                    const pct = totalQueries > 0 ? (count / totalQueries) * 100 : 0
                    let barColor = 'bg-neutral-500'
                    const lower = modelName.toLowerCase()
                    if (lower.includes('gemini')) barColor = 'bg-red-500'
                    else if (
                      lower.includes('llama') &&
                      !lower.includes('nvidia') &&
                      !lower.includes('meta/llama')
                    )
                      barColor = 'bg-orange-500'
                    else if (lower.includes('nvidia') || lower.includes('meta/llama'))
                      barColor = 'bg-green-500'
                    else if (lower.includes('groq')) barColor = 'bg-orange-500'

                    return (
                      <div key={modelName}>
                        {/* Model name row — truncates on narrow widths */}
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span
                            className="font-mono text-[11px] text-primary truncate min-w-0 flex-1"
                            title={modelName}
                          >
                            {modelName}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500 shrink-0 tabular-nums">
                            {count}q · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-sidebar-bg rounded-full overflow-hidden border border-border-app/30">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Edge status */}
            <div className="space-y-2">
              <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                Edge Deployment Status
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {['US-East-1 Edge', 'EU-Central-1 Edge'].map((edge) => (
                  <div
                    key={edge}
                    className="p-2 bg-card-bg border border-border-app rounded flex items-center justify-between gap-2 overflow-hidden"
                  >
                    <span className="text-[10px] font-mono text-neutral-400 truncate" title={edge}>
                      {edge}
                    </span>
                    <span className="text-green-500 font-bold text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      ONLINE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="px-4 py-3 border-t border-border-app bg-sidebar-bg flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TelemetryModal
