/**
 * Chat Service mapping the frontend chat functions to FastAPI endpoints.
 */

import { api } from './api'

export const chatService = {
  /**
   * Dispatches the chat prompt and metadata to the backend pipeline.
   *
   * @param {string} message - The prompt message to route.
   * @param {string|null} conversationId - The unique conversation thread id.
   * @param {string} routingPolicy - The selected routing policy preference.
   * @param {string[]|null} [attachments] - List of attachment resource strings.
   * @param {string|null} [userId] - Unique user identifier.
   * @returns {Promise<object>} Nested ChatResponse object.
   */
  async sendMessage(message, conversationId, routingPolicy, attachments = null, userId = null) {
    const payload = {
      message,
      conversation_id: conversationId,
      routing_policy: routingPolicy,
      attachments,
      user_id: userId,
    }

    return await api.post('/chat', payload)
  },

  /**
   * Queries the API server's health.
   *
   * @returns {Promise<object>} HealthResponse payload.
   */
  async healthCheck() {
    return await api.get('/health')
  },
}
