import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

// Simple consumer component
const ThemeConsumer = () => {
  const { theme, toggle } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('provides a theme value', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    const theme = screen.getByTestId('theme').textContent
    expect(['dark', 'light']).toContain(theme)
  })

  it('toggles between dark and light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    const initial = screen.getByTestId('theme').textContent
    fireEvent.click(screen.getByText('toggle'))
    const after = screen.getByTestId('theme').textContent
    expect(after).not.toBe(initial)
  })

  it('sets data-theme attribute on <html> when toggled', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByText('toggle'))
    const attr = document.documentElement.getAttribute('data-theme')
    expect(['dark', 'light']).toContain(attr)
  })

  it('throws if useTheme is used outside ThemeProvider', () => {
    // suppress console.error for this expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeConsumer />)).toThrow()
    spy.mockRestore()
  })
})
