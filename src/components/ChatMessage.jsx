import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { formatFileSize, getFileIcon } from '../utils/fileHelpers'
import RoutingCard from './RoutingCard'

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      showToast('Code copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  return (
    <div className="relative group/code my-5 rounded-xl border border-border-app bg-[#121212] overflow-hidden select-text transition-all duration-200 hover:border-border-app/80">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-app bg-[#171717]/80 text-[11px] font-mono text-[#A1A1AA] uppercase select-none">
        <span className="font-semibold tracking-wider">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-neutral-800 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
          title="Copy Code"
          aria-label="Copy Code"
        >
          {copied ? (
            <>
              <Check
                size={11}
                className="text-green-400 animate-in fade-in zoom-in-75 duration-200"
              />
              <span className="text-green-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '13.5px',
            lineHeight: '1.6',
            fontFamily:
              'Fira Code, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
          codeTagProps={{
            style: { background: 'transparent', fontFamily: 'inherit' },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary mt-7 mb-3.5 first:mt-0 font-sans border-b border-border-app/40 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg md:text-xl font-semibold tracking-tight text-primary mt-6 mb-3 first:mt-0 font-sans">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base md:text-lg font-semibold tracking-tight text-primary mt-5 mb-2 first:mt-0 font-sans">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm md:text-base font-semibold tracking-tight text-primary mt-4 mb-2 first:mt-0 font-sans">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm md:text-[15px] text-primary/95 leading-relaxed mb-4 last:mb-0 font-sans font-normal selection:bg-blue-600/30 selection:text-white">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-secondary font-sans">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-secondary font-sans">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm md:text-[15px] leading-relaxed pl-0.5">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-blue-500 bg-card-bg px-4 py-3 my-4 text-secondary italic rounded-r-lg">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 decoration-blue-500/40 hover:decoration-blue-400 inline-flex items-center gap-0.5 transition-colors group/link font-medium"
    >
      {children}
      <ExternalLink
        size={10}
        className="inline opacity-60 group-hover/link:opacity-100 transition-opacity ml-0.5 align-baseline"
      />
    </a>
  ),
  hr: () => <hr className="border-t border-border-app my-6" />,
  table: ({ children }) => (
    <div className="w-full overflow-x-auto my-6 rounded-xl border border-border-app bg-app-bg">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-card-bg border-b border-border-app text-xs font-semibold text-primary uppercase select-none">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border-app/60">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-card-bg/30 transition-colors">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-3 font-semibold text-primary">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 text-secondary leading-normal">{children}</td>,
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match || !String(children).includes('\n')
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-sidebar-bg border border-border-app font-mono text-[13px] text-blue-600 dark:text-blue-400/90 break-words">
          {children}
        </code>
      )
    }
    return <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
  },
}

const SkeletonMessage = () => (
  <div className="w-full py-8 px-4 border-b border-border-app/30 bg-transparent animate-pulse select-none">
    <div className="max-w-[850px] mx-auto flex gap-6">
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-lg bg-card-bg border border-border-app flex items-center justify-center">
          <Sparkles size={14} className="text-neutral-700" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-4 bg-card-bg rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-3.5 bg-card-bg rounded w-5/6"></div>
          <div className="h-3.5 bg-card-bg rounded w-full"></div>
          <div className="h-3.5 bg-card-bg rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
)

const ChatMessage = ({ message, onRegenerate }) => {
  const role = message?.role ?? 'assistant'
  const content = message?.content ?? ''
  const timestamp = message?.time ?? message?.timestamp
  const isStreaming = message?.isStreaming ?? false

  const model = message?.routing?.model
  const showRoutingInfo = !!message?.routing

  const isUser = role === 'user'

  const [copiedMessage, setCopiedMessage] = useState(false)
  const [rated, setRated] = useState(null)
  const { showToast } = useToast()

  const handleCopyMessage = async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessage(true)
      showToast('Message copied to clipboard!', 'success')
      setTimeout(() => setCopiedMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      showToast('Failed to copy message.', 'error')
    }
  }

  const handleThumbsUp = () => {
    const nextRated = rated === 'up' ? null : 'up'
    setRated(nextRated)
    if (nextRated) {
      showToast('Thanks for your feedback!', 'success')
    }
  }

  const handleThumbsDown = () => {
    const nextRated = rated === 'down' ? null : 'down'
    setRated(nextRated)
    if (nextRated) {
      showToast('Feedback recorded. We will improve routing parameters.', 'success')
    }
  }

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
      showToast('Shared chat link copied to clipboard!', 'success')
    } catch (err) {
      console.error('Failed to share: ', err)
    }
  }

  if (!isUser && !content && !isStreaming) {
    return <SkeletonMessage />
  }

  if (isUser) {
    return (
      <div className="w-full py-6 px-4 border-b border-border-app/20 bg-transparent group relative hover:bg-card-bg/20 transition-colors duration-200 animate-slide-in-right">
        <div className="max-w-[850px] mx-auto flex justify-end gap-4">
          <div className="max-w-[85%] flex flex-col items-end space-y-2 select-text">
            <div className="rounded-2xl px-4 py-2.5 bg-card-bg border border-border-app text-[15px] text-primary leading-relaxed break-words whitespace-pre-wrap selection:bg-blue-600/30 selection:text-white font-sans shadow-sm hover:border-border-app/80 transition-colors duration-200">
              {/* Attachment Stack inside User Message Bubble */}
              {message?.files && message.files.length > 0 && (
                <div className="flex flex-col gap-2 mb-3 border-b border-border-app/40 pb-3">
                  {message.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-sidebar-bg border border-border-app/50 max-w-sm text-left"
                    >
                      <div className="p-1 rounded bg-card-bg border border-border-app">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-primary font-medium text-xs truncate max-w-[200px]"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {content}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-secondary font-mono select-none px-1.5">
              <span>You</span>
              {timestamp && (
                <>
                  <span>•</span>
                  <span>{timestamp}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute right-4 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-app-bg/90 backdrop-blur-sm border border-border-app rounded-lg p-1 shadow-lg select-none z-10">
          <button
            onClick={handleCopyMessage}
            className="p-1.5 rounded-md hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
            title="Copy Message"
            aria-label="Copy Message"
          >
            {copiedMessage ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-md hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
            title="Share"
            aria-label="Share Message"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-8 px-4 border-b border-border-app/30 bg-transparent group relative hover:bg-card-bg/40 transition-all duration-300 animate-slide-up-fade">
      <div className="max-w-[850px] mx-auto flex gap-4 sm:gap-6">
        <div className="shrink-0 select-none">
          <div className="w-8 h-8 rounded-lg bg-card-bg border border-border-app text-blue-500 flex items-center justify-center shadow-md select-none transition-all duration-300 group-hover:border-blue-500/20 group-hover:shadow-blue-950/10">
            <Sparkles size={14} className="text-blue-500" />
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-primary select-none">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono tracking-wider uppercase text-[11px]">
              RouteMind AI
            </span>
            {timestamp && (
              <span className="text-[10px] text-neutral-500 font-mono font-normal">
                {timestamp}
              </span>
            )}
          </div>

          <div className="text-sm md:text-[15px] text-primary leading-relaxed break-words font-sans select-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>

            {isStreaming && (
              <div className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 font-medium select-none bg-blue-950/20 border border-blue-900/30 px-2.5 py-0.5 rounded-full mt-3.5 animate-pulse">
                <Loader2 size={11} className="animate-spin text-blue-400" />
                <span>Generating response...</span>
              </div>
            )}
          </div>

          {showRoutingInfo && (
            <div className="mt-4 animate-fade-in stagger-2">
              <RoutingCard routing={message.routing} />
            </div>
          )}

          <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono select-none pt-1">
            {model && (
              <>
                <span>Powered by {model}</span>
                <span>•</span>
              </>
            )}
            <span>Token Proxy Layer: Active</span>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-app-bg/90 backdrop-blur-sm border border-border-app rounded-lg p-1 shadow-lg select-none z-10">
        <button
          onClick={handleCopyMessage}
          className="p-1.5 rounded-md hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
          title="Copy Message"
          aria-label="Copy Message"
        >
          {copiedMessage ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        </button>
        <button
          onClick={() => onRegenerate && onRegenerate(message.id)}
          className="p-1.5 rounded-md hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
          title="Regenerate Response"
          aria-label="Regenerate Response"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={handleThumbsUp}
          className={`p-1.5 rounded-md hover:bg-card-bg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer ${
            rated === 'up'
              ? 'text-blue-500 hover:text-blue-600'
              : 'text-secondary hover:text-primary'
          }`}
          title="Thumbs Up"
          aria-label="Thumbs Up"
        >
          <ThumbsUp size={13} fill={rated === 'up' ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleThumbsDown}
          className={`p-1.5 rounded-md hover:bg-card-bg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer ${
            rated === 'down'
              ? 'text-red-500 hover:text-red-600'
              : 'text-secondary hover:text-primary'
          }`}
          title="Thumbs Down"
          aria-label="Thumbs Down"
        >
          <ThumbsDown size={13} fill={rated === 'down' ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 rounded-md hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
          title="Share"
          aria-label="Share Message"
        >
          <Share2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default ChatMessage
