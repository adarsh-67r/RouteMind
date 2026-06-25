import { useState, useRef, useEffect } from 'react'
import { Paperclip, ArrowUp, Sparkles, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { formatFileSize, getFileIcon } from '../utils/fileHelpers'

const SUPPORTED_EXTENSIONS = [
  'pdf',
  'txt',
  'md',
  'doc',
  'docx',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'cpp',
  'java',
  'json',
]
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

const ChatInput = ({
  onSubmit,
  isLoading = false,
  loadingStep = 'Analyzing Intent...',
  placeholder = 'Ask RouteMind a query... (e.g. Write a fast Rust HTTP server)',
  helperText = 'Code, research, writing, reasoning — RouteMind will choose the best model.',
}) => {
  const [value, setValue] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  // Auto-expand height logic
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to compute scrollHeight accurately
    textarea.style.height = 'auto'

    // Set height based on scrollHeight, constrained between 56px and 200px
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 56), 200)
    textarea.style.height = `${newHeight}px`
  }, [value])

  // Auto-focus input on load
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleFiles = (filesList) => {
    const files = Array.from(filesList)

    files.forEach((file) => {
      const fileExt = file.name.split('.').pop().toLowerCase()
      if (!SUPPORTED_EXTENSIONS.includes(fileExt)) {
        showToast('This file type is not supported.', 'error')
        return
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        showToast('Maximum file size is 20 MB.', 'error')
        return
      }

      setSelectedFiles((prev) => {
        // Prevent duplicate files by checking name and size
        if (prev.some((f) => f.name === file.name && f.size === file.size)) {
          showToast(`"${file.name}" is already attached.`, 'info')
          return prev
        }
        return [...prev, file]
      })
    })
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      // Reset input value so same file can be chosen again if removed
      e.target.value = ''
    }
  }

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      e.preventDefault()
      handleFiles(e.clipboardData.files)
    }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    const hasText = !!value.trim()
    const hasFiles = selectedFiles.length > 0

    if ((!hasText && !hasFiles) || isLoading) return

    if (onSubmit) {
      onSubmit(value.trim(), selectedFiles)
    }
    setValue('')
    setSelectedFiles([])

    // Refocus input
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getFileTypeBadge = (fileName) => {
    return fileName.split('.').pop().toUpperCase()
  }

  const isSendDisabled = (!value.trim() && selectedFiles.length === 0) || isLoading

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-4 flex flex-col gap-2">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.webp,.js,.jsx,.ts,.tsx,.py,.cpp,.java,.json"
        className="hidden"
        aria-hidden="true"
      />

      {/* Helper / Reassurance Text */}
      {!isLoading && helperText && selectedFiles.length === 0 && (
        <div className="text-xs text-neutral-500 font-mono tracking-wide px-1.5 select-none transition-opacity duration-200">
          {helperText}
        </div>
      )}

      {/* Loading Steps Indicator */}
      {isLoading && (
        <div className="text-xs text-blue-400 font-mono tracking-wide px-1.5 flex items-center gap-1.5 select-none transition-opacity duration-200">
          <Loader2 size={12} className="animate-spin text-blue-500" />
          <span className="animate-pulse">{loadingStep}</span>
        </div>
      )}

      {/* Multiple Files Preview Stack (Framer Motion) */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-2 mb-2 w-full max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, height: 0, y: 8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card-bg border border-border-app text-xs select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-sidebar-bg border border-border-app shrink-0">
                    {getFileIcon(file.name, 15)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-primary font-medium truncate max-w-[220px] xs:max-w-[340px] sm:max-w-[480px]"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-sidebar-bg border border-border-app text-[9px] font-mono text-secondary uppercase font-semibold">
                    {getFileTypeBadge(file.name)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-sidebar-bg transition-colors cursor-pointer"
                    aria-label={`Remove file ${file.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Input Surface */}
      <form
        onSubmit={handleSubmit}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col bg-card-bg border border-border-app rounded-2xl 
          transition-all duration-200 ease-out shadow-2xl p-2
          ${isLoading ? 'opacity-60 pointer-events-none' : 'focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/20'}
        `}
      >
        {/* Drag & Drop Visual Overlay */}
        <AnimatePresence>
          {dragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sidebar-bg/95 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 z-50 pointer-events-none select-none text-blue-500 dark:text-blue-400 font-mono text-xs"
            >
              <Sparkles size={20} className="text-blue-500 dark:text-blue-400 animate-pulse" />
              <span className="font-semibold">Drop files here</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isLoading}
          placeholder={isLoading ? 'RouteMind is choosing the best model...' : placeholder}
          rows={1}
          aria-label="Ask RouteMind a query"
          className="w-full bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none px-3.5 pt-2.5 pb-1 text-sm text-primary placeholder-[#71717A] resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent leading-relaxed"
          style={{ minHeight: '56px', maxHeight: '200px' }}
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between border-t border-border-app/40 pt-2 mt-2 px-1">
          {/* Left: Attach Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-neutral-500 hover:text-primary hover:bg-sidebar-bg border border-transparent hover:border-border-app/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer"
              title="Attach Files (PDF, Images, Documents, Code)"
              aria-label="Attach files"
            >
              <Paperclip size={16} />
            </button>
          </div>

          {/* Center: Subtle Routing Indicator */}
          <div className="flex items-center gap-1.5 select-none text-[10px] text-neutral-500 font-mono font-medium px-3 py-1 bg-sidebar-bg/40 border border-border-app/50 rounded-full">
            <Sparkles size={10} className="text-blue-400 animate-pulse" />
            <span>RouteMind AI</span>
          </div>

          {/* Right: Send Button */}
          <button
            type="submit"
            disabled={isSendDisabled}
            className={`
              p-2 rounded-xl flex items-center justify-center transition-all duration-200 outline-none
              ${
                !isSendDisabled
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer'
                  : 'bg-blue-50 text-blue-400 border border-blue-100 dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-800 cursor-not-allowed'
              }
            `}
            title="Send Message"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
