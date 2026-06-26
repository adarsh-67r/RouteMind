import { useEffect } from 'react'
import { X, Settings, Coins, Sparkles, Shield, Activity } from 'lucide-react'

/**
 * SettingsModal — Workspace settings panel.
 * Manages routing policy selection, account profile display, and keyboard shortcut reference.
 */
const SettingsModal = ({ isOpen, onClose, routingPolicy, setRoutingPolicy }) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const policies = [
    {
      id: 'speed',
      title: 'Speed Priority',
      desc: 'Fastest response times (Gemini Flash, GPT-4o-mini).',
      icon: Activity,
      activeClass:
        'border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-950/10 text-yellow-600 dark:text-yellow-400 font-semibold',
    },
    {
      id: 'cost',
      title: 'Cost Optimizer',
      desc: 'Routes to cheaper models (Llama 3.1 8b, Gemini Flash).',
      icon: Coins,
      activeClass:
        'border-green-500/30 bg-green-500/5 dark:bg-green-950/10 text-green-600 dark:text-green-400 font-semibold',
    },
    {
      id: 'balanced',
      title: 'Balanced AI',
      desc: 'Default RouteMind routing (Groq for code, Gemini for files).',
      icon: Sparkles,
      activeClass:
        'border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 font-semibold',
    },
    {
      id: 'quality',
      title: 'Max Quality',
      desc: 'Premium models (Llama 3.1 405b, Gemini Pro).',
      icon: Shield,
      activeClass:
        'border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400 font-semibold',
    },
  ]

  const shortcuts = [
    { action: 'Toggle Sidebar', keys: ['Ctrl', '\\'] },
    { action: 'Toggle Settings', keys: ['Ctrl', ','] },
    { action: 'Search Conversations', keys: ['Ctrl', 'K'] },
    { action: 'Close Modal / Cancel', keys: ['Esc'] },
  ]

  const Kbd = ({ k }) => (
    <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-app rounded text-[10px] font-sans shadow-sm">
      {k}
    </kbd>
  )

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-sidebar-bg border border-border-app rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-app flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-blue-400" />
            <h3 id="settings-title" className="text-sm font-semibold text-primary">
              Workspace Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-primary p-1.5 rounded-lg hover:bg-card-bg transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          <div className="p-6 space-y-6 text-xs select-none">
            {/* Account */}
            <div className="space-y-3">
              <h4 className="text-neutral-400 font-semibold uppercase tracking-widest text-[10px]">
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

            {/* Routing policy */}
            <div className="space-y-3">
              <h4 className="text-neutral-400 font-semibold uppercase tracking-widest text-[10px]">
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
                      className={`p-3 bg-card-bg border rounded-xl hover:border-blue-500/20 transition-all cursor-pointer text-left flex items-start gap-3 w-full ${
                        isSelected
                          ? `${policy.activeClass} border-blue-500/50`
                          : 'border-border-app text-neutral-400'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-current/10 text-current'
                            : 'bg-sidebar-bg text-neutral-500 border border-border-app/60 shadow-sm'
                        }`}
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
                              Active
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

            {/* Keyboard shortcuts */}
            <div className="space-y-3">
              <h4 className="text-neutral-400 font-semibold uppercase tracking-widest text-[10px]">
                Keyboard Shortcuts
              </h4>
              <div className="bg-card-bg border border-border-app rounded-lg overflow-hidden">
                {shortcuts.map(({ action, keys }, i) => (
                  <div
                    key={action}
                    className={`flex items-center justify-between px-3 py-2.5 font-mono text-[11px] ${
                      i < shortcuts.length - 1 ? 'border-b border-border-app/40' : ''
                    }`}
                  >
                    <span className="text-neutral-500">{action}</span>
                    <span className="flex items-center gap-1">
                      {keys.map((k, ki) => (
                        <span key={k} className="flex items-center gap-1">
                          {ki > 0 && <span className="text-neutral-600">+</span>}
                          <Kbd k={k} />
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 font-mono">
                Note: Ctrl+N is reserved by the browser. Use the New Chat button or sidebar instead.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-app bg-sidebar-bg flex justify-end shrink-0">
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
