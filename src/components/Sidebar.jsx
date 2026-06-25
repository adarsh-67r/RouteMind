import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
// routingStats imported on demand from localStorage where appropriate
import {
  MessageSquare,
  Plus,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Edit2,
  X,
  Laptop,
  Sparkles,
  Shield,
  Search,
  Coins,
  Activity,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { defaultStats } from '../data/mockData'
import Tooltip from './Tooltip'

const Sidebar = ({
  activeChatId = '1',
  onChatSelect = () => {},
  chatHistory = [],
  onNewChat = () => {},
  onDeleteChat = () => {},
  onRenameChat = () => {},
  isCollapsed = false,
  setIsCollapsed = () => {},
  mobileOpen = false,
  setMobileOpen = () => {},
}) => {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const editInputRef = useRef(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [routingPolicy, setRoutingPolicy] = useState(() => {
    return localStorage.getItem('routingPolicy') || 'balanced'
  })
  const [telemetryOpen, setTelemetryOpen] = useState(false)
  const [stats, setStats] = useState(() => {
    const stored = localStorage.getItem('routingStats')
    return stored ? JSON.parse(stored) : defaultStats
  })

  // Sync telemetry updates
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('routingStats')
      if (stored) {
        setStats(JSON.parse(stored))
      }
    }
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('telemetry-updated', handleUpdate)
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('telemetry-updated', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleChatSelect = (id) => {
    onChatSelect(id)
    setMobileOpen(false)
  }

  const handleCreateNewChat = useCallback(() => {
    const newId = Date.now().toString()
    const newChat = {
      id: newId,
      title: 'New Workspace Chat',
      timestamp: 'Just now',
    }
    onNewChat(newChat)
    setEditingId(newId)
    setEditTitle('New Workspace Chat')
  }, [onNewChat])

  // Cycle theme: dark → light → system → dark
  const THEME_CYCLE = ['dark', 'light', 'system']
  const handleCycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme)
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length]
    setTheme(nextTheme)
  }
  const nextThemeLabel = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]
  const themeLabels = { dark: 'Dark', light: 'Light', system: 'System' }
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop

  // Global Keyboard Shortcuts & Modal Dismissal
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Escape closes settings/telemetry modals
      if (e.key === 'Escape') {
        setSettingsOpen((prev) => (prev ? false : prev))
        setTelemetryOpen((prev) => (prev ? false : prev))
      }

      // CMD/CTRL+K to focus search input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search history..."]')
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }

      // CMD/CTRL+N to trigger a new chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleCreateNewChat()
      }

      // CMD/CTRL+\ to toggle sidebar open state
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault()
        setIsCollapsed((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [handleCreateNewChat, setIsCollapsed])

  const handleStartRename = (id, title, e) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(title)
  }

  const handleSaveRename = (id) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }
    onRenameChat(id, editTitle)
    setEditingId(null)
  }

  const handleCancelRename = () => {
    setEditingId(null)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    onDeleteChat(id)
  }

  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sidebarStyles = `
    fixed inset-y-0 left-0 z-40 flex flex-col h-screen bg-sidebar-bg text-secondary
    transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen
    ${isCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-[280px] border-r border-border-app'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarStyles} aria-label="RouteMind workspace sidebar">
        <div className="h-[76px] px-4 flex items-center justify-between border-b border-border-app overflow-hidden shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 select-none group/logo focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded p-0.5"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-card-bg border border-border-app group-hover/logo:border-blue-500/40 transition-colors duration-200 shrink-0">
              <svg
                className="w-[20px] h-[20px] text-neutral-400 group-hover/logo:text-blue-400 transition-colors duration-200"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10C12 10 14 6 18 6H24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-neutral-300 dark:text-neutral-700 group-hover/logo:text-neutral-400 dark:group-hover/logo:text-neutral-600 transition-colors duration-200"
                />
                <path
                  d="M8 16H24"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]"
                />
                <path
                  d="M8 22C12 22 14 26 18 26H24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-neutral-300 dark:text-neutral-700 group-hover/logo:text-neutral-400 dark:group-hover/logo:text-neutral-600 transition-colors duration-200"
                />
                <rect
                  x="6"
                  y="8"
                  width="4"
                  height="16"
                  rx="1"
                  className="fill-neutral-200 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700 transition-colors duration-200"
                  strokeWidth="1.5"
                />
                <circle cx="8" cy="16" r="1.5" fill="#3B82F6" />
                <circle
                  cx="24"
                  cy="6"
                  r="2"
                  className="fill-neutral-400 dark:fill-neutral-600 transition-colors duration-200"
                />
                <circle cx="24" cy="16" r="3" fill="#3B82F6" className="animate-pulse" />
                <circle
                  cx="24"
                  cy="26"
                  r="2"
                  className="fill-neutral-400 dark:fill-neutral-600 transition-colors duration-200"
                />
              </svg>
              <div className="absolute inset-0 bg-blue-500/5 blur-md rounded-lg -z-10"></div>
            </div>

            <div
              className={`flex flex-col transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden translate-x-2' : 'opacity-100 w-auto translate-x-0'}`}
            >
              <span className="text-primary font-semibold text-base tracking-tight leading-none group-hover/logo:text-primary/80 transition-colors">
                RouteMind
              </span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide mt-1.5 uppercase font-mono">
                Intelligent AI Routing
              </span>
            </div>
          </Link>

          <button
            className="md:hidden p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3.5 shrink-0">
          <Tooltip text="New Chat" isCollapsed={isCollapsed}>
            <button
              onClick={handleCreateNewChat}
              className={`
                w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                bg-sidebar-bg border border-border-app text-primary text-sm font-medium
                hover:border-blue-500/50 hover:bg-card-bg transition-all duration-200
                focus:outline-none focus:ring-1 focus:ring-blue-500/50
                active:scale-[0.98] cursor-pointer
                ${isCollapsed ? 'h-10 w-10 p-0' : 'h-10'}
              `}
              aria-label="Start new conversation"
            >
              <Plus size={16} className="text-blue-400 shrink-0" />
              <span
                className={`transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}
              >
                New Chat
              </span>
            </button>
          </Tooltip>
        </div>

        {!isCollapsed && (
          <div className="px-3.5 pb-2 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-bg border border-border-app rounded-md py-1.5 pl-8 pr-3 text-xs text-primary placeholder-neutral-500 focus:outline-none focus:border-[#3B82F6]/50 focus:ring-0 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-neutral-500 hover:text-neutral-300 p-0.5 rounded"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        <nav
          className="flex-1 overflow-y-auto px-2 py-2 space-y-1 select-none scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
          aria-label="Conversation history"
        >
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-600 font-mono">
              {!isCollapsed ? 'No chats found' : '—'}
            </div>
          ) : (
            filteredHistory.map((chat) => {
              const isActive = activeChatId === chat.id
              const isEditing = editingId === chat.id

              return (
                <Tooltip key={chat.id} text={chat.title} isCollapsed={isCollapsed}>
                  <div
                    tabIndex={0}
                    role="button"
                    aria-current={isActive ? 'true' : 'false'}
                    onClick={() => !isEditing && handleChatSelect(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleChatSelect(chat.id)
                      }
                    }}
                    className={`
                      group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 outline-none cursor-pointer
                      ${
                        isActive
                          ? 'bg-card-bg text-primary font-medium border-l-[3px] border-blue-500 pl-[9px] rounded-l-none'
                          : 'text-neutral-400 hover:bg-card-bg/50 hover:text-primary'
                      }
                      ${isCollapsed ? 'justify-center p-2 rounded-lg border-l-0 pl-2' : ''}
                    `}
                  >
                    <MessageSquare
                      size={15}
                      className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-300'}`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 pr-6">
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(chat.id)
                              if (e.key === 'Escape') handleCancelRename()
                            }}
                            className="w-full bg-sidebar-bg text-primary border border-blue-500/50 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span className="truncate text-xs text-inherit">{chat.title}</span>
                            <span className="text-[10px] text-neutral-600 font-mono mt-0.5 group-hover:text-neutral-500 transition-colors">
                              {chat.timestamp}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isCollapsed && !isEditing && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                        <button
                          onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                          className="p-1 rounded text-neutral-500 hover:text-primary hover:bg-card-bg transition-colors"
                          title="Rename"
                          aria-label={`Rename ${chat.title}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(chat.id, e)}
                          className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-card-bg transition-colors"
                          title="Delete conversation"
                          aria-label={`Delete ${chat.title}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </Tooltip>
              )
            })
          )}
        </nav>

        <div className="border-t border-border-app p-3 space-y-2 shrink-0 bg-sidebar-bg relative">
          {!isCollapsed && (
            <button
              onClick={() => setTelemetryOpen(true)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-card-bg hover:bg-sidebar-bg border border-border-app/40 hover:border-blue-500/30 text-[10px] text-neutral-400 font-mono flex items-center justify-between select-none transition-all active:scale-[0.98] outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer"
              title="Open Live Proxy Telemetry Dashboard"
              aria-label="Open Live Proxy Telemetry Dashboard"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Routed: {stats.totalQueries} queries
              </span>
              <span className="text-blue-400 font-semibold text-[9px] tracking-wide font-mono bg-blue-950/20 px-1 py-0.5 rounded border border-blue-500/20">
                TELEMETRY
              </span>
            </button>
          )}

          <div
            className={`flex items-center gap-3 px-1.5 py-1 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Tooltip text="Alex Chen (Developer Account)" isCollapsed={isCollapsed}>
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-card-bg border border-border-app flex items-center justify-center text-xs font-semibold text-blue-400 ring-2 ring-blue-500/10">
                  AC
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-sidebar-bg rounded-full"></div>
              </div>
            </Tooltip>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary truncate">Alex Chen</p>
                <p className="text-[10px] text-neutral-500 font-mono truncate">alex@routemind.ai</p>
              </div>
            )}

            {!isCollapsed && (
              <span className="px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/20 text-[9px] font-mono text-blue-400 select-none">
                Pro
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 pt-1 border-t border-border-app/40 ${isCollapsed ? 'flex-col items-center' : 'justify-between'}`}
          >
            <Tooltip text="Settings" isCollapsed={isCollapsed}>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                aria-label="Open project settings"
              >
                <Settings size={15} />
              </button>
            </Tooltip>

            {/* Theme cycle button — click to rotate: dark → light → system → dark */}
            <Tooltip
              text={`Theme: ${themeLabels[theme]} (click for ${themeLabels[nextThemeLabel]})`}
              isCollapsed={isCollapsed}
            >
              <button
                onClick={handleCycleTheme}
                className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
                aria-label={`Current theme: ${themeLabels[theme]}. Click to switch to ${themeLabels[nextThemeLabel]}`}
              >
                <ThemeIcon size={15} />
              </button>
            </Tooltip>

            <Tooltip
              text={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              isCollapsed={isCollapsed}
            >
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                aria-label={isCollapsed ? 'Expand sidebar panel' : 'Collapse sidebar panel'}
              >
                {isCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {settingsOpen && (
          <div
            onClick={() => setSettingsOpen(false)}
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
                  onClick={() => setSettingsOpen(false)}
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
                    {[
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
                        id: 'accuracy',
                        title: 'Max Accuracy',
                        desc: 'Primary tier-1 premium models (Claude 3.5, GPT-4o).',
                        icon: Shield,
                        activeClass:
                          'border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400 font-semibold shadow-sm shadow-purple-950/5',
                      },
                    ].map((policy) => {
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
                  onClick={() => setSettingsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {telemetryOpen && (
          <div
            onClick={() => setTelemetryOpen(false)}
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
                  onClick={() => setTelemetryOpen(false)}
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
                    <p className="text-lg font-bold text-blue-500 font-mono">&lt;12ms</p>
                  </div>
                </div>

                <div className="space-y-3 bg-card-bg border border-border-app rounded-lg p-4">
                  <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] mb-2 font-mono">
                    Model Utilization Distribution
                  </h4>
                  <div className="space-y-2.5">
                    {Object.entries(stats.models).map(([modelName, count]) => {
                      const percentage =
                        stats.totalQueries > 0 ? (count / stats.totalQueries) * 100 : 0

                      let colorClass = 'bg-blue-500'
                      if (modelName.includes('Claude')) colorClass = 'bg-orange-500'
                      else if (modelName.includes('Gemini')) colorClass = 'bg-red-500'
                      else if (modelName.includes('DeepSeek')) colorClass = 'bg-green-500'
                      else if (modelName.includes('Perplexity')) colorClass = 'bg-cyan-500'

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
                  onClick={() => setTelemetryOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
