import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Cpu, Loader2, Sliders } from 'lucide-react'

import { ROUTING_STAGES as STAGES, MODEL_CANDIDATES as CANDIDATES } from '../data/mockData'

const TypingIndicator = ({ loadingStep, selectedModel, selectionReason }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [candidateIndex, setCandidateIndex] = useState(0)

  // Map loadingStep text to index
  const getActiveStepIndex = (stepText) => {
    const text = String(stepText || '').toLowerCase()
    if (text.includes('intent') || text.includes('analyzing')) return 0
    if (text.includes('comparing') || text.includes('models')) return 1
    if (text.includes('cost') || text.includes('evaluating') || text.includes('calculating'))
      return 2
    if (text.includes('selecting') || text.includes('model') || text.includes('provider')) return 3
    if (text.includes('generating') || text.includes('response') || text.includes('streaming'))
      return 4
    return 0
  }

  // Smoothly increment steps internally as target changes to simulate human-like planning
  // FIX Bug 3: guard against running past the last stage index so the component
  // never goes blank due to an uncapped interval
  useEffect(() => {
    const targetStep = getActiveStepIndex(loadingStep)
    const maxStep = STAGES.length - 1

    const runStepTransition = () => {
      setCurrentStep((prev) => {
        // Never exceed the target or the last valid stage index
        if (prev >= targetStep || prev >= maxStep) return prev
        return prev + 1
      })
    }

    const initialTimeout = setTimeout(runStepTransition, 0)
    const interval = setInterval(runStepTransition, 450)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [loadingStep])

  // Rotate candidates during provider selection phase
  useEffect(() => {
    if (currentStep === 3) {
      const interval = setInterval(() => {
        setCandidateIndex((prev) => (prev + 1) % CANDIDATES.length)
      }, 350)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // FIX Bug 4: use the selectedModel passed from Chat.jsx (the actual routing decision).
  // Only fall back to a default if nothing has been decided yet (early loading stages).
  const selectedModelVal = selectedModel ?? 'Deciding...'
  const selectedReasonVal = selectionReason ?? 'Evaluating the optimal model for your query...'

  const isStreaming = currentStep === 4

  return (
    <div className="w-full max-w-[500px] bg-card-bg border border-border-app rounded-xl p-4 shadow-sm select-none text-left transition-all duration-200 hover:border-border-app/80 hover:shadow-lg mt-4 ml-14">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-app/60 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sliders size={12} />
          </div>
          <span className="text-[11px] font-semibold text-primary tracking-wider uppercase font-mono">
            RouteMind Processing
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span className="text-[10px] text-[#22C55E] font-mono font-medium">LIVE</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isStreaming ? (
          /* Streaming response state layout */
          <motion.div
            key="streaming"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="flex items-center justify-between py-2 text-xs"
          >
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Loader2 size={13} className="animate-spin text-blue-500" />
              <span>Generating response via</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-[11px] bg-sidebar-bg border border-border-app px-2 py-0.5 rounded animate-pulse">
                {selectedModelVal}
              </span>
            </div>
            <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse rounded-sm" />
          </motion.div>
        ) : (
          /* Process stages steps list layout */
          <motion.div key="stages" className="space-y-2.5">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStep
              const isActive = idx === currentStep

              return (
                <div key={stage.id} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2.5">
                    {isCompleted ? (
                      <CheckCircle2 size={13} className="text-[#22C55E] shrink-0" />
                    ) : isActive ? (
                      <div className="relative flex items-center justify-center h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                      </div>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-800 border border-neutral-400/40 dark:border-neutral-700/60 ml-0.5 shrink-0"></div>
                    )}
                    <span
                      className={`font-medium transition-colors duration-200 ${
                        isCompleted
                          ? 'text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-800'
                          : isActive
                            ? 'text-primary font-semibold'
                            : 'text-neutral-500 dark:text-neutral-600'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {/* Active candidate rotation in step 3 */}
                  {isActive && stage.id === 'provider' && (
                    <div className="flex items-center gap-1.5 select-none shrink-0">
                      <span className="text-[9px] text-neutral-500 font-mono">Evaluating:</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={candidateIndex}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.12 }}
                          className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-semibold"
                        >
                          {CANDIDATES[candidateIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Decision Reveal panel (appears right before generation) */}
      <AnimatePresence>
        {currentStep >= 3 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3.5 pt-3.5 border-t border-border-app/80 flex flex-col gap-1.5 text-[11px] overflow-hidden"
          >
            <div className="flex items-center justify-between text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
              <span>Optimal Route Selected</span>
              <span className="flex items-center gap-1 text-[#22C55E] font-sans font-normal animate-pulse">
                Ready
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu size={12} className="text-blue-500" />
              <span className="font-semibold text-primary font-mono">{selectedModelVal}</span>
            </div>
            <div className="text-secondary leading-relaxed text-[11px] bg-sidebar-bg border border-border-app rounded-lg p-2.5 mt-0.5">
              {selectedReasonVal}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Future-Ready Architecture Placeholders */}
      <div className="mt-3.5 pt-3.5 border-t border-border-app/40 flex items-center justify-between text-[9px] font-mono text-neutral-600 opacity-60 select-none pointer-events-none">
        <div>
          Est. Cost: <span className="text-neutral-500">Slot Ready</span>
        </div>
        <div>
          Latency: <span className="text-neutral-500">Slot Ready</span>
        </div>
        <div>
          Confidence: <span className="text-neutral-500">Slot Ready</span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
