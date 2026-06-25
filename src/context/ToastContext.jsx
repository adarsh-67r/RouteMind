/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Check, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext({
  showToast: () => {},
})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ThemeAwareToastProviderValue showToast={showToast} toasts={toasts} removeToast={removeToast}>
      {children}
    </ThemeAwareToastProviderValue>
  )
}

const ThemeAwareToastProviderValue = ({ showToast, toasts, removeToast, children }) => {
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl w-full text-xs font-medium leading-normal bg-sidebar-bg border-border-app`}
            >
              {toast.type === 'success' && <Check size={14} className="text-green-500 shrink-0" />}
              {toast.type === 'error' && (
                <AlertCircle size={14} className="text-red-500 shrink-0" />
              )}
              {toast.type === 'info' && <Info size={14} className="text-blue-500 shrink-0" />}
              <span className="text-primary flex-1 truncate">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-primary p-0.5 rounded transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
