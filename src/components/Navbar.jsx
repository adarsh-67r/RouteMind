import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import AuthenticationComingSoonModal from './AuthenticationComingSoonModal'

const THEME_CYCLE = ['dark', 'light', 'system']

const THEME_META = {
  dark: { icon: Moon, label: 'Dark', next: 'Light' },
  light: { icon: Sun, label: 'Light', next: 'System' },
  system: { icon: Laptop, label: 'System', next: 'Dark' },
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleCycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]
    setTheme(next)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const {
    icon: ThemeIcon,
    label: themeLabel,
    next: themeNext,
  } = THEME_META[theme] ?? THEME_META.dark

  return (
    <header
      className={`sticky top-0 z-50 w-full h-[76px] flex items-center transition-all duration-300 ${
        scrolled
          ? 'bg-app-bg/90 backdrop-blur-md border-b border-border-app/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-app-bg border-b border-border-app/30'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left Section: Logo & Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg p-1"
          aria-label="RouteMind Home"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-bg border border-border-app group-hover:border-blue-500/40 transition-colors duration-300">
            <svg
              className="w-[22px] h-[22px] text-neutral-400 group-hover:text-blue-400 transition-colors duration-300"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10C12 10 14 6 18 6H24"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-400 dark:group-hover:text-neutral-600 transition-colors duration-300"
              />
              <path
                d="M8 16H24"
                stroke="#0066FF"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_rgba(0,102,255,0.6)]"
              />
              <path
                d="M8 22C12 22 14 26 18 26H24"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-neutral-700 group-hover:text-neutral-600 transition-colors duration-300"
              />
              <rect
                x="6"
                y="8"
                width="4"
                height="16"
                rx="1"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-neutral-600 group-hover:text-neutral-500 transition-colors duration-300"
              />
              <circle cx="8" cy="16" r="1.5" fill="#0066FF" />
              <circle
                cx="24"
                cy="6"
                r="2"
                className="fill-neutral-400 dark:fill-neutral-600 transition-colors duration-300"
              />
              <circle cx="24" cy="16" r="3" fill="#0066FF" className="animate-pulse" />
              <circle
                cx="24"
                cy="26"
                r="2"
                className="fill-neutral-400 dark:fill-neutral-600 transition-colors duration-300"
              />
            </svg>
            <div className="absolute inset-0 bg-blue-500/5 blur-md rounded-lg group-hover:bg-blue-500/10 transition-colors duration-300 -z-10"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-primary font-semibold text-[17px] tracking-tight leading-none group-hover:text-primary/80 transition-colors">
              RouteMind
            </span>
            <span className="text-[10px] text-neutral-500 font-medium tracking-wide mt-1 hidden lg:block uppercase font-mono">
              Intelligent AI Routing
            </span>
          </div>
        </Link>

        {/* Center Section: Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-x-6 lg:gap-x-8"
          aria-label="Global navigation"
        >
          {[
            { label: 'Features', href: '/#features' },
            { label: 'Benefits', href: '/benefits' },
            { label: 'Documentation', href: '/docs' },
          ].map((link) => {
            const isInternal = link.href.startsWith('/')
            return isInternal ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors duration-200 relative py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors duration-200 relative py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Right Section: Actions */}
        <div className="hidden md:flex items-center gap-x-4">
          <a
            href="https://github.com/pritesh-4/RouteMind"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-card-bg border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label="GitHub Repository"
          >
            <svg
              className="w-[19px] h-[19px]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>

          {/* Theme cycle button — dark → light → system → dark */}
          <button
            onClick={handleCycleTheme}
            title={`Theme: ${themeLabel} (click for ${themeNext})`}
            aria-label={`Theme: ${themeLabel}. Click to switch to ${themeNext}`}
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-card-bg border border-transparent hover:border-border-app transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 cursor-pointer"
          >
            <ThemeIcon size={18} />
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="hidden lg:inline-flex text-secondary hover:text-primary text-sm font-medium px-3 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer"
          >
            Sign In
          </button>

          <Link
            to="/chat"
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-medium px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50 shadow-[0_0_15px_rgba(0,102,255,0.15)] hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg focus-visible:ring-blue-500"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-card-bg transition-all focus:outline-none focus:ring-1 focus:ring-border-app"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`absolute top-[76px] left-0 w-full bg-app-bg border-b border-border-app transition-all duration-300 ease-in-out z-40 md:hidden overflow-hidden ${
          isOpen ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4 max-w-7xl mx-auto sm:px-6">
          <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Benefits', href: '/benefits' },
              { label: 'Documentation', href: '/docs' },
            ].map((link) => {
              const isInternal = link.href.startsWith('/')
              return isInternal ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-secondary hover:text-primary text-[15px] font-medium py-1.5 transition-colors border-b border-border-app/40 block"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-secondary hover:text-primary text-[15px] font-medium py-1.5 transition-colors border-b border-border-app/40 block"
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-border-app flex flex-col gap-3">
            {/* Mobile Theme Cycle Button */}
            <button
              onClick={handleCycleTheme}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border-app bg-card-bg/40 hover:bg-card-bg text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer"
              aria-label={`Theme: ${themeLabel}. Click to switch to ${themeNext}`}
            >
              <div className="flex items-center gap-2.5">
                <ThemeIcon size={16} />
                <span className="text-[15px] font-medium">Theme: {themeLabel}</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">→ {themeNext}</span>
            </button>

            <a
              href="https://github.com/pritesh-4/RouteMind"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-secondary hover:text-primary text-[15px] font-medium py-1"
            >
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub Repository</span>
            </a>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setAuthModalOpen(true)
                }}
                className="text-center text-secondary hover:text-primary text-sm font-medium py-2.5 rounded-lg border border-border-app bg-card-bg/40 hover:bg-card-bg transition-colors focus:outline-none cursor-pointer"
              >
                Sign In
              </button>
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className="text-center bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-medium py-2.5 rounded-lg border border-blue-500/30 transition-colors focus:outline-none"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AuthenticationComingSoonModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  )
}

export default Navbar
