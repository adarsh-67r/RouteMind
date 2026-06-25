import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Menu, PanelLeft, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import TypingIndicator from '../components/TypingIndicator'
import { chatService } from '../services/chatService'
import { useToast } from '../context/ToastContext'
import { defaultStats } from '../data/mockData'

const Chat = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState('1')
  const { showToast } = useToast()

  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'RouteMind Introduction', timestamp: 'Just now' },
    { id: '2', title: 'Code Performance Tuning', timestamp: '2h ago' },
    { id: '3', title: 'LLM Routing Benchmarks', timestamp: 'Yesterday' },
  ])

  const [conversationsMessages, setConversationsMessages] = useState({
    1: [],
    2: [
      {
        id: 'm1',
        role: 'user',
        content: 'Explain how to write a simple fast async HTTP server in Rust.',
        time: '2h ago',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'To build a fast, async HTTP server in Rust, we should use Tokio as the async runtime and Axum (built on top of hyper and tower) as the web framework. Here is a basic implementation:\n\n```rust\nuse axum::{routing::get, Router};\n\n#[tokio::main]\nasync fn main() {\n    let app = Router::new().route("/", get(|| async { "Hello from RouteMind!" }));\n    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();\n    axum::serve(listener, app).await.unwrap();\n}\n```',
        time: '2h ago',
        routing: {
          model: 'Claude 3.5 Sonnet',
          cost: '$0.0058',
          confidence: '99%',
          reason:
            'Routed to Claude 3.5 Sonnet for precise code syntax formulation and optimized system design instructions.',
        },
      },
    ],
    3: [
      {
        id: 'm3',
        role: 'user',
        content: 'What is the latency difference between Gemini 1.5 Flash and GPT-4o?',
        time: 'Yesterday',
      },
      {
        id: 'm4',
        role: 'assistant',
        content:
          'Gemini 1.5 Flash exhibits significantly lower latency for structured data tasks, typically landing under 300ms. GPT-4o has a higher latency overhead (~500-800ms) but offers superior reasoning depths for highly semantic contexts.',
        time: 'Yesterday',
        routing: {
          model: 'Gemini 1.5 Flash',
          cost: '$0.00008',
          confidence: '94%',
          reason:
            'Routed to Gemini 1.5 Flash as cost constraints and simple latency inquiries benefit from faster token processing.',
        },
      },
    ],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('Analyzing Intent...')
  const [pendingModel, setPendingModel] = useState(null)
  const messagesEndRef = useRef(null)
  const messageIdRef = useRef(100)
  const timeoutRefs = useRef([])

  const [routingPolicy, setRoutingPolicy] = useState(() => {
    return localStorage.getItem('routingPolicy') || 'balanced'
  })

  // Sync routing policy updates
  useEffect(() => {
    const handlePolicyUpdate = () => {
      setRoutingPolicy(localStorage.getItem('routingPolicy') || 'balanced')
    }
    window.addEventListener('policy-updated', handlePolicyUpdate)
    return () => {
      window.removeEventListener('policy-updated', handlePolicyUpdate)
    }
  }, [])

  const currentMessages = conversationsMessages[activeChatId] || []

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length, isLoading])

  const handleNewChat = (newChat) => {
    setChatHistory((prev) => [newChat, ...prev])
    setActiveChatId(newChat.id)
    setConversationsMessages((prev) => ({ ...prev, [newChat.id]: [] }))
  }

  const handleDeleteChat = (id) => {
    const updated = chatHistory.filter((c) => c.id !== id)
    const newMessages = { ...conversationsMessages }
    delete newMessages[id]
    setConversationsMessages(newMessages)
    if (updated.length === 0) {
      const newId = Date.now().toString()
      const newChat = { id: newId, title: 'New Workspace Chat', timestamp: 'Just now' }
      setChatHistory([newChat])
      setActiveChatId(newId)
    } else {
      setChatHistory(updated)
      if (activeChatId === id) {
        setActiveChatId(updated[0].id)
      }
    }
  }

  const handleRenameChat = (id, newTitle) => {
    setChatHistory((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)))
  }

  const handleSendMessage = async (content, attachedFiles = []) => {
    const hasText = !!content.trim()
    const hasFiles = attachedFiles && attachedFiles.length > 0
    if ((!hasText && !hasFiles) || isLoading) return

    const isFirstMessage = currentMessages.length === 0

    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    const chatIdAtSend = activeChatId
    messageIdRef.current += 1

    const filesMetadata = hasFiles
      ? attachedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type || f.name.split('.').pop(),
        }))
      : []

    const userMsg = {
      id: `user-${messageIdRef.current}`,
      role: 'user',
      content: content.trim(),
      time: 'Just now',
      files: filesMetadata,
    }

    setConversationsMessages((prev) => ({
      ...prev,
      [chatIdAtSend]: [...(prev[chatIdAtSend] || []), userMsg],
    }))

    setIsLoading(true)
    setPendingModel(null)
    setLoadingStep(hasFiles ? 'Reading attachments...' : 'Analyzing Intent...')

    // Extract attachments string array if present
    const attachments = hasFiles ? attachedFiles.map((f) => f.name) : null

    // Trigger API call to the backend concurrently
    const apiCallPromise = chatService.sendMessage(
      content.trim(),
      chatIdAtSend,
      routingPolicy,
      attachments
    )

    // Timeline stages execution helper
    const delay = (ms) =>
      new Promise((resolve) => {
        const t = setTimeout(resolve, ms)
        timeoutRefs.current.push(t)
      })

    try {
      // Stage 1: Wait 1s and show Step 2
      await delay(1000)
      setLoadingStep(hasFiles ? 'Extracting semantic metadata...' : 'Comparing Models...')

      // Stage 2: Wait 1s and show Step 3 (Selecting Best Model)
      await delay(1000)
      setLoadingStep('Selecting Best Model...')

      // Await backend response here if it hasn't completed yet
      const backendResponse = await apiCallPromise

      const { response: backendResponseDetail, routing: backendRoutingDetail } = backendResponse
      const model = backendRoutingDetail.selected_model
      const reply = backendResponseDetail.content

      // Reveal selected model preview badge in loading indicator
      setPendingModel(model)

      // Stage 3: Wait 1s and show Step 4 (Generating Response)
      await delay(1000)
      setLoadingStep('Generating Response...')

      // Append assistant streaming placeholder message
      const assistantMsgId = `assistant-${messageIdRef.current + 1}`
      const assistantMsgPlaceholder = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        time: 'Just now',
        isStreaming: true,
        routing: backendRoutingDetail, // Pass the direct backend routing object!
      }

      setConversationsMessages((prev) => {
        const existingMsgs = prev[chatIdAtSend] || []
        return { ...prev, [chatIdAtSend]: [...existingMsgs, assistantMsgPlaceholder] }
      })

      // Stage 4: Wait 1.2s and reveal full answer
      await delay(1200)
      messageIdRef.current += 1

      const assistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: reply,
        time: 'Just now',
        isStreaming: false,
        routing: backendRoutingDetail, // Pass the direct backend routing object!
      }

      setConversationsMessages((prev) => {
        const existingMsgs = prev[chatIdAtSend] || []
        return {
          ...prev,
          [chatIdAtSend]: existingMsgs.map((m) => (m.id === assistantMsgId ? assistantMsg : m)),
        }
      })

      // Update live telemetry stats in localStorage
      const storedStats = localStorage.getItem('routingStats')
      const stats = storedStats ? JSON.parse(storedStats) : defaultStats
      stats.totalQueries += 1

      // Calculate savings metrics dynamically based on provider
      let savedAmount = 0.0025
      if (
        model.includes('mini') ||
        model.includes('Flash') ||
        model.includes('Haiku') ||
        model.includes('DeepSeek')
      ) {
        savedAmount = 0.0038
      } else if (model.includes('Pro') || model.includes('Sonnet')) {
        savedAmount = 0.001
      }
      stats.savings = parseFloat((stats.savings + savedAmount).toFixed(4))
      stats.models[model] = (stats.models[model] || 0) + 1
      localStorage.setItem('routingStats', JSON.stringify(stats))
      window.dispatchEvent(new Event('telemetry-updated'))

      // Update chat title on first message using content or file
      setChatHistory((prevHistory) => {
        const chatIndex = prevHistory.findIndex((c) => c.id === chatIdAtSend)
        if (chatIndex === -1) return prevHistory
        const chat = prevHistory[chatIndex]
        if (isFirstMessage && chat.title === 'New Workspace Chat') {
          const titleText = content.trim()
            ? content
            : hasFiles
              ? `File: ${attachedFiles[0].name}`
              : 'New Workspace Chat'
          const shortened = titleText.length > 25 ? `${titleText.substring(0, 25)}...` : titleText
          const updated = [...prevHistory]
          updated[chatIndex] = { ...chat, title: shortened }
          return updated
        }
        return prevHistory
      })
    } catch (err) {
      console.error('API request failed:', err)
      showToast(err.message || 'Failed to communicate with RouteMind API.', 'error')

      // Append assistant error message
      const assistantMsgId = `assistant-err-${messageIdRef.current + 1}`
      const assistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: `⚠️ **RouteMind API Error:** ${err.message || 'The server returned an unexpected error or is offline. Please check that the backend is running at http://localhost:8000.'}`,
        time: 'Just now',
        isStreaming: false,
      }

      setConversationsMessages((prev) => {
        const existingMsgs = prev[chatIdAtSend] || []
        return { ...prev, [chatIdAtSend]: [...existingMsgs, assistantMsg] }
      })
    } finally {
      setIsLoading(false)
      setPendingModel(null)
    }
  }

  const handleRegenerateResponse = (messageId) => {
    if (isLoading) return
    const messages = conversationsMessages[activeChatId] || []
    const index = messages.findIndex((m) => m.id === messageId)
    if (index === -1) return

    // Find the user prompt preceding this message
    let promptMsg = null
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        promptMsg = messages[i]
        break
      }
    }

    if (!promptMsg) return

    setConversationsMessages((prev) => {
      const chatMsgs = prev[activeChatId] || []
      return {
        ...prev,
        [activeChatId]: chatMsgs.slice(0, index),
      }
    })

    const originalFiles = promptMsg.files
      ? promptMsg.files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        }))
      : []

    handleSendMessage(promptMsg.content, originalFiles)
  }

  const handleClearConversation = () => {
    setConversationsMessages((prev) => ({
      ...prev,
      [activeChatId]: [],
    }))
    showToast('Conversation cleared.', 'info')
  }

  // Stagger delays for welcome screen prompt cards
  const cardDelays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4']

  return (
    <div className="h-screen bg-app-bg flex text-primary overflow-hidden font-sans selection:bg-blue-600/30 selection:text-white">
      <Sidebar
        activeChatId={activeChatId}
        onChatSelect={setActiveChatId}
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-app-bg min-w-0">
        {/* Header — full width on mobile, respects sidebar on desktop */}
        <header className="flex items-center justify-between px-3 sm:px-4 h-14 border-b border-blue-100 dark:border-border-app bg-blue-50/80 dark:bg-[#0E0E0E] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop: expand collapsed sidebar */}
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
                aria-label="Expand sidebar"
              >
                <PanelLeft size={16} />
              </button>
            )}

            {/* Mobile: hamburger — always visible, full touch target */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Link
                to="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-xs tracking-wider font-mono uppercase transition-all duration-200 shrink-0"
              >
                RouteMind
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700 text-xs shrink-0">/</span>
              {/* Truncate long chat titles gracefully on small screens */}
              <span className="text-secondary text-xs font-medium truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[240px]">
                {chatHistory.find((c) => c.id === activeChatId)?.title || 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentMessages.length > 0 && (
              <button
                onClick={handleClearConversation}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-card-bg border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 flex items-center gap-1.5 cursor-pointer shrink-0"
                aria-label="Clear active conversation"
                title="Clear conversation messages"
              >
                <Trash2 size={15} />
                <span className="text-xs font-medium hidden sm:inline">Clear Chat</span>
              </button>
            )}

            <button
              onClick={() => {
                const newId = Date.now().toString()
                handleNewChat({ id: newId, title: 'New Workspace Chat', timestamp: 'Just now' })
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Start new chat"
            >
              <Plus size={16} />
              {/* Label hidden on very small screens to prevent overflow */}
              <span className="text-xs font-medium hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto bg-app-bg scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {currentMessages.length === 0 ? (
            // Welcome state — staggered entrance on each card
            <div className="min-h-full flex flex-col items-center justify-center max-w-[850px] mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center space-y-10 sm:space-y-12 select-none">
              <div className="space-y-4 animate-slide-up-fade">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-50 dark:bg-blue-950/20 text-xs font-medium text-blue-600 dark:text-blue-400 font-mono">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                  Active Proxy Node: US-East-1 Edge
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary leading-tight font-sans">
                  RouteMind
                </h2>
                <p className="text-base sm:text-xl font-medium text-neutral-700 dark:text-neutral-300">
                  One Interface. Every AI. Zero Guesswork.
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Ask naturally. RouteMind automatically chooses the best AI model for every task.
                </p>
              </div>

              {/* Prompt suggestion cards with staggered entrance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl pt-2">
                {[
                  'Debug my React project',
                  'Summarize this research paper',
                  'Explain transformers simply',
                  'Compare Next.js and Remix',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className={`p-4 bg-card-bg hover:bg-sidebar-bg border border-border-app hover:border-blue-500/30 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer animate-slide-up-fade ${cardDelays[idx]}`}
                  >
                    <p className="text-xs font-semibold text-primary group-hover:text-primary transition-colors">
                      {prompt}
                    </p>
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-500 mt-1 leading-normal">
                      Click to submit query directly to RouteMind proxy.
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {currentMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onRegenerate={handleRegenerateResponse} />
              ))}
              {isLoading && (
                <TypingIndicator loadingStep={loadingStep} selectedModel={pendingModel} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer input — safe-area padding for mobile browsers */}
        <div className="bg-app-bg border-t border-border-app/40 shrink-0 pb-safe">
          <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} loadingStep={loadingStep} />
        </div>
      </div>
    </div>
  )
}

export default Chat
