import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Check, X, ShieldAlert, ArrowRight } from 'lucide-react'

const FUTURE_FEATURES = [
  'Cloud Chat History',
  'Personalized Routing Preferences',
  'Saved Conversations',
  'Cross-Device Sync',
  'Team Collaboration',
  'Usage Analytics',
]

const AuthenticationComingSoonModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null)
  const backdropRef = useRef(null)

  // Focus trap & Escape listener for Accessibility compliance
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap logic
      if (e.key === 'Tab') {
        if (!modalRef.current) return
        const focusableElements = modalRef.current.querySelectorAll(
          'button, a, input, select, textarea, [tabindex="0"]'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    // Trap focus to primary dismiss trigger on open
    const prevActiveElement = document.activeElement
    const focusable = modalRef.current?.querySelectorAll('button')
    if (focusable && focusable.length > 0) {
      // Focus on the Got It dismiss button first
      focusable[focusable.length - 2]?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      prevActiveElement?.focus()
    }
  }, [isOpen, onClose])

  // Backdrop click dismiss handler
  const handleBackdropClick = (e) => {
    if (backdropRef.current === e.target) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-subtitle"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full max-w-[480px] bg-card-bg border border-border-app rounded-2xl overflow-hidden shadow-2xl p-6 relative flex flex-col gap-6"
          >
            {/* Elegant upper status badge */}
            <div className="flex items-center justify-between border-b border-border-app/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Lock size={15} />
                </div>
                <div>
                  <h3 id="modal-title" className="text-sm font-semibold text-primary font-sans">
                    RouteMind Accounts
                  </h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 text-[9px] font-mono text-blue-600 dark:text-blue-400 select-none font-semibold">
                Coming Soon
              </span>
            </div>

            {/* Subtitle / Context info */}
            <div className="space-y-1.5 text-left">
              <p
                id="modal-subtitle"
                className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed"
              >
                Authentication and account features are currently in development.
              </p>
            </div>

            {/* Futures list section wrapper */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-neutral-600 dark:text-neutral-500 font-semibold tracking-wider uppercase text-left">
                Planned features in next build release:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-neutral-700 dark:text-neutral-300 font-sans font-medium">
                {FUTURE_FEATURES.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 bg-sidebar-bg/40 border border-border-app/30 p-2.5 rounded-lg"
                  >
                    <Check size={12} className="text-blue-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal footer text */}
            <div className="flex gap-2 p-3 bg-sidebar-bg/60 border border-border-app/40 rounded-xl text-left select-none text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
              <ShieldAlert
                size={15}
                className="text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5"
              />
              <p>
                RouteMind is currently focused on delivering the best AI routing experience. Account
                functionality will be introduced in a future release.
              </p>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-app/30">
              <Link
                to="/docs#roadmap"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary hover:bg-sidebar-bg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
              >
                <span>View Roadmap</span>
                <ArrowRight size={12} />
              </Link>

              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-blue-500/30 transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card-bg focus-visible:ring-blue-500 cursor-pointer"
              >
                Got It
              </button>
            </div>

            {/* Close trigger button in top right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-primary rounded-lg hover:bg-sidebar-bg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
              aria-label="Dismiss accounts info modal"
            >
              <X size={15} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AuthenticationComingSoonModal
