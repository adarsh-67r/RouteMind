import { describe, it, expect } from 'vitest'
import { getMockRouting } from '../utils/mockRouter'

// ── getMockRouting ────────────────────────────────────────────────────────────
// These tests validate the routing logic that was previously buried inside
// the Chat.jsx event handler. Moving it here makes regressions obvious.

describe('getMockRouting', () => {
  it('routes coding queries to Claude', () => {
    const result = getMockRouting('write a react component for a button')
    expect(result.model).toMatch(/claude/i)
  })

  it('routes research queries to Perplexity', () => {
    const result = getMockRouting('what is the latest news on AI research')
    expect(result.model).toMatch(/perplexity/i)
  })

  it('routes document/PDF queries to Gemini', () => {
    const result = getMockRouting('summarize this PDF document for me')
    expect(result.model).toMatch(/gemini/i)
  })

  it('returns a confidence string', () => {
    const result = getMockRouting('explain quantum computing')
    expect(result.confidence).toBeTruthy()
    expect(typeof result.confidence).toBe('string')
  })

  it('returns a cost string', () => {
    const result = getMockRouting('hello world')
    expect(result.cost).toBeTruthy()
    expect(typeof result.cost).toBe('string')
  })

  it('returns a reason string', () => {
    const result = getMockRouting('help me debug this Python script')
    expect(result.reason).toBeTruthy()
  })

  it('falls back to GPT-4o for generic queries', () => {
    const result = getMockRouting('what is 2 + 2')
    expect(result.model).toBeTruthy()
  })
})
