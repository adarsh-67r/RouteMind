import { X, Activity } from 'lucide-react'

/**
 * TelemetryModal — Live routing telemetry dashboard extracted from Sidebar.
 * Displays routing statistics, model utilization, and edge deployment status.
 */
const TelemetryModal = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-sidebar-bg border border-border-app rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="telemetry-title"
      >
        <div className="px-5 py-4 border-b border-border-app flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            <h3 id="telemetry-title" className="text-sm font-semibold text-primary">
              Live Routing Telemetry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-card-bg border border-border-app rounded-lg text-center">
              <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider mb-1">
                Total Routed
              </p>
              <p className="text-lg font-bold text-primary font-mono">{stats.totalQueries}</p>
            </div>
            <div className="p-3 bg-card-bg border border-border-app rounded-lg text-center relative overflow-hidden">
              <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider mb-1">
                Est. Savings
              </p>
              <p className="text-lg font-bold text-green-500 font-mono flex items-center justify-center gap-1">
                <span>${stats.savings.toFixed(3)}</span>
              </p>
            </div>
            <div className="p-3 bg-card-bg border border-border-app rounded-lg text-center">
              <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider mb-1">
                Overhead Latency
              </p>
              <p className="text-lg font-bold text-blue-500 font-mono">
                {stats.avgOverhead ? `${Math.round(stats.avgOverhead)}ms` : '<12ms'}
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-card-bg border border-border-app rounded-lg p-4">
            <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] mb-2 font-mono">
              Model Utilization Distribution
            </h4>
            <div className="space-y-2.5">
              {Object.entries(stats.models).map(([modelName, count]) => {
                const percentage = stats.totalQueries > 0 ? (count / stats.totalQueries) * 100 : 0

                let colorClass = 'bg-neutral-500'
                if (modelName.toLowerCase().includes('gemini')) colorClass = 'bg-red-500'
                else if (
                  modelName.toLowerCase().includes('groq') ||
                  (modelName.toLowerCase().includes('llama') &&
                    !modelName.toLowerCase().includes('nvidia') &&
                    !modelName.toLowerCase().includes('meta/llama'))
                )
                  colorClass = 'bg-orange-500'
                else if (
                  modelName.toLowerCase().includes('nvidia') ||
                  modelName.toLowerCase().includes('meta/llama')
                )
                  colorClass = 'bg-green-500'

                return (
                  <div key={modelName} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-primary">
                      <span className="font-mono">{modelName}</span>
                      <span className="font-mono text-neutral-500">
                        {count} queries ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-sidebar-bg rounded-full overflow-hidden border border-border-app/30">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
              Edge Deployment Status
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 bg-card-bg border border-border-app rounded flex justify-between items-center">
                <span className="text-neutral-400">US-East-1 Edge</span>
                <span className="text-green-500 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="p-2 bg-card-bg border border-border-app rounded flex justify-between items-center">
                <span className="text-neutral-400">EU-Central-1 Edge</span>
                <span className="text-green-500 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border-app bg-sidebar-bg flex justify-end gap-2">
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
