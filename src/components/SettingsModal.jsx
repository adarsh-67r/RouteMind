import { X, Settings, Coins, Sparkles, Shield, Activity } from 'lucide-react'

/**
 * SettingsModal — Workspace settings panel extracted from Sidebar.
 * Manages routing policy selection, account profile display, and keyboard shortcut reference.
 */
const SettingsModal = ({ isOpen, onClose, routingPolicy, setRoutingPolicy }) => {
  if (!isOpen) return null

  const policies = [
    {
      id: 'speed',
      title: 'Speed Priority',
      desc: 'Fastest response times (Gemini Flash, GPT-4o-mini).',
      icon: Activity,
      activeClass:
        'border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-950/10 text-yellow-600 dark:text-yellow-400 font-semibold shadow-sm shadow-yellow-950/5',
    },
    {
      id: 'cost',
      title: 'Cost Optimizer',
      desc: 'Routes to cheaper models (DeepSeek, GPT-4o-mini).',
      icon: Coins,
      activeClass:
        'border-green-500/30 bg-green-500/5 dark:bg-green-950/10 text-green-600 dark:text-green-400 font-semibold shadow-sm shadow-green-950/5',
    },
    {
      id: 'balanced',
      title: 'Balanced AI',
      desc: 'Default RouteMind proxies (Claude for code, Gemini for files).',
      icon: Sparkles,
      activeClass:
        'border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm shadow-blue-950/5',
    },
    {
      id: 'quality',
      title: 'Max Quality',
      desc: 'Primary tier-1 premium models (Claude 3.5 Sonnet, GPT-4o).',
      icon: Shield,
      activeClass:
        'border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400 font-semibold shadow-sm shadow-purple-950/5',
    },
  ]

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-sidebar-bg border border-border-app rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="px-5 py-4 border-b border-border-app flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-blue-400" />
            <h3 id="settings-title" className="text-sm font-semibold text-primary">
              Workspace Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-primary p-1.5 rounded-lg hover:bg-card-bg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-6 text-xs select-none">
          <div className="space-y-3">
            <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] tracking-widest">
              Account Profile
            </h4>
            <div className="p-3 bg-card-bg border border-border-app rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-bg border border-border-app flex items-center justify-center text-sm font-semibold text-blue-400 shrink-0">
                AC
              </div>
              <div className="space-y-0.5">
                <p className="text-primary font-semibold text-sm leading-none">Alex Chen</p>
                <p className="text-neutral-500 font-mono text-[11px]">alex@routemind.ai</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] tracking-widest">
              Model Routing Preferences
            </h4>
            <div className="flex flex-col gap-2">
              {policies.map((policy) => {
                const Icon = policy.icon
                const isSelected = routingPolicy === policy.id
                return (
                  <button
                    type="button"
                    key={policy.id}
                    onClick={() => {
                      setRoutingPolicy(policy.id)
                      localStorage.setItem('routingPolicy', policy.id)
                      window.dispatchEvent(new Event('policy-updated'))
                    }}
                    className={`p-3 bg-card-bg border rounded-xl hover:border-blue-500/20 hover:bg-card-bg/80 transition-all cursor-pointer text-left flex items-start gap-3 w-full ${
                      isSelected
                        ? `${policy.activeClass} border-blue-500/50`
                        : 'border-border-app text-neutral-400'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-current/10 text-current' : 'bg-sidebar-bg text-neutral-500 border border-border-app/60 shadow-sm'}`}
                    >
                      <Icon size={13} className="text-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-semibold text-[11px] ${isSelected ? 'text-primary' : 'text-neutral-400'}`}
                        >
                          {policy.title}
                        </p>
                        {isSelected && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider font-mono text-current bg-current/10 px-1.5 py-0.5 rounded-md leading-none">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[10px] leading-relaxed mt-0.5">
                        {policy.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] tracking-widest">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between items-center py-2.5 border-b border-border-app/40">
                <span className="text-neutral-500">New Conversation</span>
                <span className="text-primary flex items-center gap-1 font-semibold">
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    Ctrl
                  </kbd>{' '}
                  +{' '}
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    N
                  </kbd>
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border-app/40">
                <span className="text-neutral-500">Toggle Sidebar panel</span>
                <span className="text-primary flex items-center gap-1 font-semibold">
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    Ctrl
                  </kbd>{' '}
                  +{' '}
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    \
                  </kbd>
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-neutral-500">Search Conversations</span>
                <span className="text-primary flex items-center gap-1 font-semibold">
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    Ctrl
                  </kbd>{' '}
                  +{' '}
                  <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
                    K
                  </kbd>
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
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
