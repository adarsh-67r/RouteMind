/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'dark', // 'light' or 'dark'
})

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  })

  const setTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark' && newTheme !== 'system') {
      return
    }
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    const root = window.document.documentElement

    const handleThemeChange = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      const targetTheme = isDark ? 'dark' : 'light'
      setResolvedTheme(targetTheme)

      // Add temporary transition class
      root.classList.add('theme-transition')

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      // Remove transition class after it finishes
      const timer = setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 300)

      return () => clearTimeout(timer)
    }

    const cleanUp = handleThemeChange()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => {
        handleThemeChange()
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener)
      } else {
        mediaQuery.addListener(listener)
      }

      return () => {
        cleanUp && cleanUp()
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', listener)
        } else {
          mediaQuery.removeListener(listener)
        }
      }
    }

    return cleanUp
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
