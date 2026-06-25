"""
Abstract Base Provider interface for RouteMind.
This module defines the contract that all LLM providers must implement,
ensuring the platform remains decoupled from any specific LLM provider's SDK.

Why does provider abstraction exist?
1. Loose Coupling: RouteMind can switch or route dynamically between OpenAI, Claude,
   and Gemini without changing core routing, logging, or business logic.
2. Interface Uniformity: Every provider accepts a uniform prompt and settings,
   and returns responses in a unified, predictable structure.
3. Resiliency & Error Mapping: Unique exceptions from each vendor's SDK are mapped
   into standard local RouteMind exception types, allowing robust fallback and retry policies.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class ProviderError(Exception):
    """Base exception class for all errors originating in the provider layer."""

    pass


class ProviderAuthenticationError(ProviderError):
    """Raised when authentication credentials (e.g., API keys) are invalid or missing."""

    pass


class ProviderAPIError(ProviderError):
    """Raised when an API request fails, returns an error status, or is rate-limited."""

    pass


class ProviderConnectionError(ProviderError):
    """Raised when network connection problems prevent communication with the provider's endpoint."""

    pass


class BaseProvider(ABC):
    """
    Abstract Base Class defining the contract for all AI model providers.
    Every LLM integration in RouteMind must inherit from this class and implement its interface.
    """

    @abstractmethod
    def generate_response(
        self, prompt: str, model: str = None, **kwargs
    ) -> Dict[str, Any]:
        """
        Generates a non-streaming completion response from the model provider.

        Args:
            prompt: The string message/prompt to send to the model.
            model: Optional model identifier. If None, the provider's default model will be used.
            **kwargs: Extra parameters to pass to the underlying provider API (e.g., temperature, max_tokens).

        Returns:
            A standardized dictionary containing:
            {
                "response": str,            # The generated content
                "selected_model": str,      # Actual model used
                "provider": str,            # Provider identifier (e.g. 'openai')
                "latency_ms": float,        # API call round-trip latency in milliseconds
                "usage": {
                    "prompt_tokens": int,
                    "completion_tokens": int,
                    "total_tokens": int
                }
            }

        Raises:
            ProviderAuthenticationError: If credentials or API keys are missing/invalid.
            ProviderConnectionError: If connectivity or DNS issues occur.
            ProviderAPIError: For general API failures, malformed requests, or rate limits.
        """
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """
        Performs a lightweight sanity check to verify if the provider API is accessible
        and functional (e.g. checking auth, simple ping, or model enumeration).

        Returns:
            bool: True if the provider is healthy and ready to accept requests, False otherwise.
        """
        pass

    @abstractmethod
    def provider_name(self) -> str:
        """
        Returns the unique identifier name for the provider.

        Returns:
            str: Normalized lowercase name of the provider (e.g., 'openai', 'claude', 'gemini').
        """
        pass
