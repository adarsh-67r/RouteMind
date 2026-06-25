"""
Gemini/Google Provider implementation placeholder for RouteMind.
"""

import logging
from typing import Dict, Any
from app.providers.base import BaseProvider

logger = logging.getLogger("routemind.providers.gemini")


class GeminiProvider(BaseProvider):
    """
    Gemini provider integration implementing the BaseProvider contract.
    This class is currently a placeholder and does not perform active external calls.
    """

    def __init__(self):
        """
        Initializes the Gemini provider.
        """
        logger.info("Initializing GeminiProvider placeholder.")

    def provider_name(self) -> str:
        """
        Returns the unique provider name.
        """
        return "gemini"

    def generate_response(
        self, prompt: str, model: str = None, **kwargs
    ) -> Dict[str, Any]:
        """
        Placeholder method for Gemini response generation.

        Raises:
            NotImplementedError: Always raised since the provider is not yet implemented.
        """
        model_to_use = model or "gemini-1.5-pro"
        logger.warning(
            "Provider selected: gemini (Placeholder triggered. Model: %s)", model_to_use
        )
        raise NotImplementedError(
            "Gemini integration is not implemented. Please configure OpenAI or implement this provider."
        )

    def health_check(self) -> bool:
        """
        Placeholder method for Gemini health check.
        """
        logger.warning("Gemini health check triggered (Placeholder returning False).")
        return False
