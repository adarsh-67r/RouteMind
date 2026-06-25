import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { routingStats } from '../data/mockData'
import { 
  MessageSquare, Plus, Settings, Sun, Moon, 
  PanelLeftClose, PanelLeft, Trash2, Edit2, X,
  Laptop, Sparkles, Command, Shield, Search
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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
  setMobileOpen = () => {}
}) => {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const editInputRef = useRef(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const themeDropdownRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false)
      }
    }
    if (themeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [themeDropdownOpen])

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
      timestamp: 'Just now'
    }
    onNewChat(newChat)
    setEditingId(newId)
    setEditTitle('New Workspace Chat')
  }, [onNewChat])

  // Global Keyboard Shortcuts & Modal Dismissal
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Escape closes settings modal
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false)
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
        setIsCollapsed(!isCollapsed)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [settingsOpen, isCollapsed, chatHistory, handleCreateNewChat, setIsCollapsed])

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

  const filteredHistory = chatHistory.filter(chat => 
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
          <Link to="/" className="flex items-center gap-3 select-none group/logo focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded p-0.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-card-bg border border-border-app group-hover/logo:border-blue-500/40 transition-colors duration-200 shrink-0">
              <svg 
                className="w-[20px] h-[20px] text-neutral-400 group-hover/logo:text-blue-400 transition-colors duration-200" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 10C12 10 14 6 18 6H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-700" />
                <path d="M8 16H24" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                <path d="M8 22C12 22 14 26 18 26H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-700" />
                <rect x="6" y="8" width="4" height="16" rx="1" fill="#171717" stroke="currentColor" strokeWidth="1.5" className="text-neutral-600" />
                <circle cx="8" cy="16" r="1.5" fill="#3B82F6" />
                <circle cx="24" cy="6" r="2" fill="#404040" />
                <circle cx="24" cy="16" r="3" fill="#3B82F6" className="animate-pulse" />
                <circle cx="24" cy="26" r="2" fill="#404040" />
              </svg>
              <div className="absolute inset-0 bg-blue-500/5 blur-md rounded-lg -z-10"></div>
            </div>
            
            <div className={`flex flex-col transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden translate-x-2' : 'opacity-100 w-auto translate-x-0'}`}>
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
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
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
                      ${isActive 
                        ? 'bg-card-bg text-primary font-medium border-l-[3px] border-blue-500 pl-[9px] rounded-l-none' 
                        : 'text-neutral-400 hover:bg-card-bg/50 hover:text-primary'
                      }
                      ${isCollapsed ? 'justify-center p-2 rounded-lg border-l-0 pl-2' : ''}
                    `}
                  >
                    <MessageSquare size={15} className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />

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
            <div className="px-2.5 py-1.5 rounded-lg bg-card-bg border border-border-app/40 text-[10px] text-neutral-400 font-mono flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Routed: {routingStats.totalQueries} queries
              </span>
              <span className="text-blue-400 font-semibold text-[9px] tracking-wide font-mono bg-blue-950/20 px-1 py-0.5 rounded border border-blue-500/20">PROXY</span>
            </div>
          )}

          <div className={`flex items-center gap-3 px-1.5 py-1 ${isCollapsed ? 'justify-center' : ''}`}>
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

          <div className={`flex items-center gap-1.5 pt-1 border-t border-border-app/40 ${isCollapsed ? 'flex-col items-center' : 'justify-between'}`}>
            
            <Tooltip text="Settings" isCollapsed={isCollapsed}>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                aria-label="Open project settings"
              >
                <Settings size={15} />
              </button>
            </Tooltip>

            <div className="relative" ref={themeDropdownRef}>
              <Tooltip text={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`} isCollapsed={isCollapsed}>
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className={`p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer ${themeDropdownOpen ? 'bg-card-bg text-primary border-border-app' : ''}`}
                  aria-label="Toggle visual theme"
                  aria-haspopup="true"
                  aria-expanded={themeDropdownOpen}
                >
                  {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Laptop size={15} />}
                </button>
              </Tooltip>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`absolute bottom-full z-50 mb-2 bg-sidebar-bg border border-border-app rounded-lg shadow-xl p-1 w-32 ${isCollapsed ? 'left-0' : 'right-0'}`}
                  >
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Laptop },
                    ].map((opt) => {
                      const Icon = opt.icon
                      const isSelected = theme === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setTheme(opt.id)
                            setThemeDropdownOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left cursor-pointer focus:outline-none focus:bg-card-bg transition-colors ${
                            isSelected 
                              ? 'bg-blue-600/10 text-blue-400 font-medium' 
                              : 'text-neutral-400 hover:bg-card-bg/50 hover:text-primary'
                          }`}
                        >
                          <Icon size={13} className={isSelected ? 'text-blue-400' : 'text-neutral-500'} />
                          <span>{opt.label}</span>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Tooltip text={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} isCollapsed={isCollapsed}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg text-neutral-400 hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                aria-label={isCollapsed ? "Expand sidebar panel" : "Collapse sidebar panel"}
              >
                {isCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div 
              className="bg-sidebar-bg border border-border-app rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
            >
              <div className="px-5 py-4 border-b border-border-app flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-blue-400" />
                  <h3 id="settings-title" className="text-sm font-semibold text-primary">Workspace Settings</h3>
                </div>
                <button 
                  onClick={() => setSettingsOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-2">
                  <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">Account Profile</h4>
                  <div className="p-3 bg-card-bg border border-border-app rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sidebar-bg border border-border-app flex items-center justify-center text-sm font-semibold text-blue-400">
                      AC
                    </div>
                    <div>
                      <p className="text-primary font-medium text-sm">Alex Chen</p>
                      <p className="text-neutral-500 font-mono">alex@routemind.ai</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">Model Routing Preferences</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-card-bg border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer">
                      <p className="text-primary font-medium mb-1 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-blue-400" /> Cost Optimizer
                      </p>
                      <p className="text-neutral-500 text-[10px]">Routes to the cheapest capable model for standard queries.</p>
                    </div>
                    <div className="p-2.5 bg-card-bg border border-border-app hover:border-blue-500/40 transition-colors cursor-pointer">
                      <p className="text-neutral-400 font-medium mb-1 flex items-center gap-1.5">
                        <Shield size={13} className="text-neutral-500" /> Max Accuracy
                      </p>
                      <p className="text-neutral-500 text-[10px]">Always defaults to primary tier-1 LLMs like Claude 3.5 Sonnet.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">Keyboard Shortcuts</h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between py-1 border-b border-border-app/40">
                      <span className="text-neutral-500">New Conversation</span>
                      <span className="text-primary flex items-center gap-0.5"><Command size={10} />N</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-app/40">
                      <span className="text-neutral-500">Toggle Sidebar panel</span>
                      <span className="text-primary flex items-center gap-0.5"><Command size={10} />\</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Search Conversations</span>
                      <span className="text-primary flex items-center gap-0.5"><Command size={10} />K</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border-app bg-sidebar-bg flex justify-end gap-2">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

const Tooltip = ({ text, isCollapsed, children }) => {
  if (!isCollapsed) return children
  return (
    <div className="relative group/tooltip flex items-center">
      {children}
      <div className="absolute left-[60px] ml-2 px-2.5 py-1.5 bg-[#181818] border border-border-app text-xs font-medium text-primary rounded-md shadow-xl opacity-0 translate-x-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
        {text}
      </div>
    </div>
  )
}

export default Sidebar
