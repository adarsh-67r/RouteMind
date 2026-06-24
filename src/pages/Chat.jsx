import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Menu, PanelLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import TypingIndicator from '../components/TypingIndicator'

const Chat = () => {
  // Sidebar & Layout State
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState('1')

  // Chat conversations list state
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'RouteMind Introduction', timestamp: 'Just now' },
    { id: '2', title: 'Code Performance Tuning', timestamp: '2h ago' },
    { id: '3', title: 'LLM Routing Benchmarks', timestamp: 'Yesterday' }
  ])

  // Message store for conversations
  const [conversationsMessages, setConversationsMessages] = useState({
    '1': [],
    '2': [
      { id: 'm1', role: 'user', content: 'Explain how to write a simple fast async HTTP server in Rust.', time: '2h ago' },
      {
        id: 'm2',
        role: 'assistant',
        content: 'To build a fast, async HTTP server in Rust, we should use Tokio as the async runtime and Axum (built on top of hyper and tower) as the web framework. Here is a basic implementation:\n\n```rust\nuse axum::{routing::get, Router};\n\n#[tokio::main]\nasync fn main() {\n    let app = Router::new().route("/", get(|| async { "Hello from RouteMind!" }));\n    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();\n    axum::serve(listener, app).await.unwrap();\n}\n```',
        time: '2h ago',
        routing: {
          model: 'Claude 3.5 Sonnet',
          cost: '$0.0058',
          confidence: '99%',
          reason: 'Routed to Claude 3.5 Sonnet for precise code syntax formulation and optimized system design instructions.'
        }
      }
    ],
    '3': [
      { id: 'm3', role: 'user', content: 'What is the latency difference between Gemini 1.5 Flash and GPT-4o?', time: 'Yesterday' },
      {
        id: 'm4',
        role: 'assistant',
        content: 'Gemini 1.5 Flash exhibits significantly lower latency for structured data tasks, typically landing under 300ms. GPT-4o has a higher latency overhead (~500-800ms) but offers superior reasoning depths for highly semantic contexts.',
        time: 'Yesterday',
        routing: {
          model: 'Gemini 1.5 Flash',
          cost: '$0.00008',
          confidence: '94%',
          reason: 'Routed to Gemini 1.5 Flash as cost constraints and simple latency inquiries benefit from faster token processing.'
        }
      }
    ]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('Analyzing Intent...')
  // FIX Bug 4: track the model chosen by routing so TypingIndicator shows the correct name
  const [pendingModel, setPendingModel] = useState(null)
  const messagesEndRef = useRef(null)
  const messageIdRef = useRef(100)
  // FIX Bug 2: store timeout IDs so we can cancel them if user switches chat or unmounts
  const timeoutRefs = useRef([])

  const currentMessages = conversationsMessages[activeChatId] || []

  // Cancel all pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  // Auto-scroll to bottom of workspace
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length, isLoading])

  // New Chat initialization
  const handleNewChat = (newChat) => {
    setChatHistory(prev => [newChat, ...prev])
    setActiveChatId(newChat.id)
    setConversationsMessages(prev => ({
      ...prev,
      [newChat.id]: []
    }))
  }

  const handleDeleteChat = (id) => {
    const updated = chatHistory.filter(c => c.id !== id)
    setChatHistory(updated)
    const newMessages = { ...conversationsMessages }
    delete newMessages[id]
    setConversationsMessages(newMessages)

    if (activeChatId === id && updated.length > 0) {
      setActiveChatId(updated[0].id)
    }
  }

  const handleRenameChat = (id, newTitle) => {
    setChatHistory(prev =>
      prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
    )
  }

  // Handle prompt submissions
  const handleSendMessage = (content) => {
    if (!content.trim() || isLoading) return

    // FIX Bug 2: cancel any in-flight timers from a previous message before starting new ones
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    // Snapshot the active chat ID at the time of sending so all callbacks
    // write to the correct conversation even if the user switches chats
    const chatIdAtSend = activeChatId

    messageIdRef.current += 1
    const userMsg = {
      id: `user-${messageIdRef.current}`,
      role: 'user',
      content: content.trim(),
      time: 'Just now'
    }

    setConversationsMessages(prev => ({
      ...prev,
      [chatIdAtSend]: [...(prev[chatIdAtSend] || []), userMsg]
    }))

    setIsLoading(true)
    setPendingModel(null)
    setLoadingStep('Analyzing Intent...')

    // Determine routing result up-front so all stages can reference it
    const query = content.toLowerCase()
    let model = 'GPT-4o'
    let cost = '$0.0022'
    let confidence = '95%'
    let reason = 'Automatically routed to GPT-4o as the request requires balanced cost-efficiency and general reasoning.'
    let reply = 'I have analyzed your prompt and successfully routed it to GPT-4o. Let me know if you would like me to unpack these suggestions further!'

    if (query.includes('react') || query.includes('code') || query.includes('rust') || query.includes('next.js') || query.includes('remix')) {
      model = 'Claude 3.5 Sonnet'
      cost = '$0.0048'
      confidence = '99%'
      reason = 'Routed to Claude 3.5 Sonnet due to its superior coding benchmarks and precise structural output.'
      if (query.includes('react') || query.includes('next.js') || query.includes('remix')) {
        reply = 'When structural modularity is required, React components should be separated by concerns. Using Next.js or Remix allows you to leverage server rendering to optimize load times and bundle sizes. Here is a recommended architectural flow.'
      } else if (query.includes('rust')) {
        reply = 'Rust async programming model relies on Futures, which are polled by a runtime like Tokio. To maximize throughput, minimize mutex contention and write lock-free state managers where appropriate.'
      }
    } else if (query.includes('paper') || query.includes('transformer') || query.includes('explain') || query.includes('summarize')) {
      model = 'Gemini 1.5 Pro'
      cost = '$0.0015'
      confidence = '93%'
      reason = 'Routed to Gemini 1.5 Pro due to long-context reasoning capabilities and complex semantic mapping.'
      reply = 'The self-attention mechanism computes representations of sequence elements by relating different positions of a single sequence. This allows the model to process context globally rather than sequentially.'
    }

    // FIX Bug 4: expose the decided model to TypingIndicator immediately
    // so it shows the correct name in its "Optimal Route Selected" panel
    const t1 = setTimeout(() => {
      setLoadingStep('Comparing Models...')

      const t2 = setTimeout(() => {
        setLoadingStep('Selecting Best Model...')
        // Reveal the actual model name at the "selecting" stage
        setPendingModel(model)

        const t3 = setTimeout(() => {
          setLoadingStep('Generating Response...')

          const t4 = setTimeout(() => {
            messageIdRef.current += 1
            const assistantMsg = {
              id: `assistant-${messageIdRef.current}`,
              role: 'assistant',
              content: reply,
              time: 'Just now',
              routing: { model, cost, confidence, reason }
            }

            // FIX Bug 2: write to the snapshotted chat ID, not the current activeChatId
            // FIX Bug 1: use the functional updater to check the live message count,
            // avoiding the stale-closure problem that prevented auto-rename from firing
            setConversationsMessages(prev => {
              const existingMsgs = prev[chatIdAtSend] || []
              return {
                ...prev,
                [chatIdAtSend]: [...existingMsgs, assistantMsg]
              }
            })

            // FIX Bug 1: rename the chat using state at callback time, not render time.
            // We check chatHistory via setChatHistory's functional form to get fresh data.
            setChatHistory(prevHistory => {
              const chatIndex = prevHistory.findIndex(c => c.id === chatIdAtSend)
              if (chatIndex === -1) return prevHistory
              const chat = prevHistory[chatIndex]
              // Only auto-rename if the chat still has its default placeholder title
              // and only has the single user message we just added (i.e. it was a fresh chat)
              const msgsAtCallback = conversationsMessages[chatIdAtSend] || []
              const isFirstMessage = msgsAtCallback.length <= 1
              if (isFirstMessage && chat.title === 'New Workspace Chat') {
                const shortened = content.length > 25 ? `${content.substring(0, 25)}...` : content
                const updated = [...prevHistory]
                updated[chatIndex] = { ...chat, title: shortened }
                return updated
              }
              return prevHistory
            })

            setIsLoading(false)
            setPendingModel(null)
          }, 1200)
          timeoutRefs.current.push(t4)
        }, 1000)
        timeoutRefs.current.push(t3)
      }, 1000)
      timeoutRefs.current.push(t2)
    }, 1000)
    timeoutRefs.current.push(t1)
  }

  return (
    <div className="h-screen bg-app-bg flex text-[#FAFAFA] overflow-hidden font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Sidebar Navigation */}
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

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-app-bg">
        {/* Unified Workspace Header */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-border-app bg-[#0E0E0E] shrink-0">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Toggle (Only visible when collapsed) */}
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-[#FAFAFA] hover:bg-neutral-900 border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
                aria-label="Expand sidebar"
              >
                <PanelLeft size={16} />
              </button>
            )}

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-[#FAFAFA] hover:bg-neutral-900 border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Link to="/" className="text-white font-semibold text-xs tracking-wider font-mono uppercase text-blue-400 hover:text-blue-300 transition-all duration-200">
                RouteMind
              </Link>
              <span className="text-neutral-700 text-xs">/</span>
              <span className="text-neutral-400 text-xs font-medium truncate max-w-[150px] sm:max-w-[240px]">
                {chatHistory.find(c => c.id === activeChatId)?.title || 'Workspace'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const newId = Date.now().toString()
              handleNewChat({ id: newId, title: 'New Workspace Chat', timestamp: 'Just now' })
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 flex items-center gap-1.5 cursor-pointer"
            aria-label="Start new chat"
          >
            <Plus size={16} />
            <span className="text-xs font-medium hidden sm:inline">New Chat</span>
          </button>
        </header>

        {/* Scrollable Conversation Workspace */}
        <div className="flex-1 overflow-y-auto bg-app-bg scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {currentMessages.length === 0 ? (
            /* Welcome / Hero State */
            <div className="min-h-full flex flex-col items-center justify-center max-w-[850px] mx-auto px-6 py-20 text-center space-y-12 select-none">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/20 text-xs font-medium text-blue-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Active Proxy Node: US-East-1 Edge
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  RouteMind
                </h2>
                <p className="text-lg sm:text-xl font-medium text-neutral-300">
                  One Interface. Every AI. Zero Guesswork.
                </p>
                <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Ask naturally. RouteMind automatically chooses the best AI model for every task.
                </p>
              </div>

              {/* Prompt Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl pt-4">
                {[
                  "Debug my React project",
                  "Summarize this research paper",
                  "Explain transformers simply",
                  "Compare Next.js and Remix"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 bg-card-bg hover:bg-sidebar-bg border border-border-app hover:border-blue-500/30 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-primary group-hover:text-white transition-colors">{prompt}</p>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-normal">Click to submit query directly to RouteMind proxy.</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Feed State */
            <div className="pb-32">
              {currentMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Typing/Routing Stage Indicator */}
              {isLoading && (
                <TypingIndicator
                  loadingStep={loadingStep}
                  selectedModel={pendingModel}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Footer Input Bar */}
        <div className="bg-app-bg border-t border-border-app/40 shrink-0">
          <ChatInput
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat
