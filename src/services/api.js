/**
 * Generic API Client Service for RouteMind.
 * Handles base URLs, standard GET/POST methods, custom timeouts, and error handling.
 */

// Use VITE_API_URL from environment variables, fallback to local FastAPI default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEFAULT_TIMEOUT_MS = 15000 // 15 seconds default timeout

/**
 * Handles HTTP response check and centralizes error throwing.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected server error occurred.'
    try {
      const errorData = await response.json()
      errorDetail = errorData.detail || errorDetail
    } catch {
      // JSON parsing failed, use statusText or default
      errorDetail = response.statusText || errorDetail
    }

    const error = new Error(errorDetail)
    error.status = response.status
    throw error
  }

  // Parse JSON response safely
  try {
    return await response.json()
  } catch (err) {
    throw new Error('Failed to parse response payload as JSON.', { cause: err })
  }
}

/**
 * Helper to fetch with timeout capability using AbortController.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms.`, { cause: error })
    }
    throw error
  }
}

export const api = {
  /**
   * Generic GET request helper.
   * @param {string} endpoint
   * @param {number} [timeout]
   * @returns {Promise<any>}
   */
  async get(endpoint, timeout) {
    const url = `${BASE_URL}${endpoint}`
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
    try {
      const response = await fetchWithTimeout(url, options, timeout)
      return await handleResponse(response)
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error)
      throw error
    }
  },

  /**
   * Generic POST request helper.
   * @param {string} endpoint
   * @param {object} body
   * @param {number} [timeout]
   * @returns {Promise<any>}
   */
  async post(endpoint, body, timeout) {
    const url = `${BASE_URL}${endpoint}`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    }
    try {
      const response = await fetchWithTimeout(url, options, timeout)
      return await handleResponse(response)
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  },
}
