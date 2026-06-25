"""
OpenAI Provider implementation for RouteMind.
"""

import time
import logging
from typing import Dict, Any

from openai import (
    OpenAI,
    OpenAIError,
    AuthenticationError,
    APIConnectionError,
    RateLimitError,
)

from app.config import settings
from app.providers.base import (
    BaseProvider,
    ProviderAuthenticationError,
    ProviderAPIError,
    ProviderConnectionError,
)

logger = logging.getLogger("routemind.providers.openai")


class OpenAIProvider(BaseProvider):
    """
    OpenAI provider integration implementing the BaseProvider contract.
    Connects to the official OpenAI python SDK and routes chat completions.
    """

    def __init__(self):
        """
        Initializes the OpenAI provider.
        Loads the API key dynamically from settings.
        """
        self.api_key = settings.OPENAI_API_KEY
        self.default_model = "gpt-4o-mini"
        self._client = None

    @property
    def client(self) -> OpenAI:
        """
        Retrieves the shared OpenAI client instance.
        Instantiated lazily to prevent errors on startup when keys are missing.
        """
        if not self._client:
            if not self.api_key:
                raise ProviderAuthenticationError(
                    "OpenAI API Key is not configured. Please set the OPENAI_API_KEY environment variable."
                )
            self._client = OpenAI(api_key=self.api_key)
        return self._client

    def provider_name(self) -> str:
        """
        Returns the unique provider name.
        """
        return "openai"

    def generate_response(
        self, prompt: str, model: str = None, **kwargs
    ) -> Dict[str, Any]:
        """
        Generates a non-streaming chat completion using OpenAI.

        Args:
            prompt: The string message to send.
            model: The target model (e.g., 'gpt-4o-mini', 'gpt-4o'). If None, default is used.
            **kwargs: Extra parameters passed to the chat completions API (e.g. temperature).

        Returns:
            Standard response dictionary.
        """
        model_to_use = model or self.default_model
        logger.info("Provider selected: openai (Model: %s)", model_to_use)

        start_time = time.perf_counter()
        try:
            client = self.client
            messages = [{"role": "user", "content": prompt}]

            # API Call
            response = client.chat.completions.create(
                model=model_to_use, messages=messages, **kwargs
            )

            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.info("OpenAI API call successful. Latency: %.2f ms", latency_ms)

            # Extract content and usage data
            choice = response.choices[0]
            usage = response.usage

            return {
                "response": choice.message.content or "",
                "selected_model": model_to_use,
                "provider": self.provider_name(),
                "latency_ms": latency_ms,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens if usage else 0,
                    "completion_tokens": usage.completion_tokens if usage else 0,
                    "total_tokens": usage.total_tokens if usage else 0,
                },
            }

        except AuthenticationError as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "OpenAI Authentication Error: %s (Latency: %.2f ms)", str(e), latency_ms
            )
            raise ProviderAuthenticationError(
                f"OpenAI Authentication failed: {e}"
            ) from e

        except APIConnectionError as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "OpenAI Connection Error: %s (Latency: %.2f ms)", str(e), latency_ms
            )
            raise ProviderConnectionError(
                f"Failed to connect to OpenAI API: {e}"
            ) from e

        except RateLimitError as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "OpenAI Rate Limit Error: %s (Latency: %.2f ms)", str(e), latency_ms
            )
            raise ProviderAPIError(f"OpenAI Rate limit exceeded: {e}") from e

        except OpenAIError as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.error("OpenAI API Error: %s (Latency: %.2f ms)", str(e), latency_ms)
            raise ProviderAPIError(f"OpenAI API error occurred: {e}") from e

        except Exception as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "Unexpected error in OpenAI provider: %s (Latency: %.2f ms)",
                str(e),
                latency_ms,
            )
            raise ProviderAPIError(
                f"An unexpected error occurred during the OpenAI call: {e}"
            ) from e

    def health_check(self) -> bool:
        """
        Lightweight health check using model listing.
        """
        try:
            self.client.models.list()
            return True
        except Exception as e:
            logger.error("OpenAI health check failed: %s", str(e))
            return False
