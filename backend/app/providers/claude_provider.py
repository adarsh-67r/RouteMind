"""
Claude/Anthropic Provider implementation placeholder for RouteMind.
"""

import logging
from typing import Dict, Any
from app.providers.base import BaseProvider

logger = logging.getLogger("routemind.providers.claude")


class ClaudeProvider(BaseProvider):
    """
    Claude provider integration implementing the BaseProvider contract.
    This class is currently a placeholder and does not perform active external calls.
    """

    def __init__(self):
        """
        Initializes the Claude provider.
        """
        logger.info("Initializing ClaudeProvider placeholder.")

    def provider_name(self) -> str:
        """
        Returns the unique provider name.
        """
        return "claude"

    def generate_response(
        self, prompt: str, model: str = None, **kwargs
    ) -> Dict[str, Any]:
        """
        Placeholder method for Claude response generation.

        Raises:
            NotImplementedError: Always raised since the provider is not yet implemented.
        """
        model_to_use = model or "claude-3-5-sonnet"
        logger.warning(
            "Provider selected: claude (Placeholder triggered. Model: %s)", model_to_use
        )
        raise NotImplementedError(
            "Claude integration is not implemented. Please configure OpenAI or implement this provider."
        )

    def health_check(self) -> bool:
        """
        Placeholder method for Claude health check.
        """
        logger.warning("Claude health check triggered (Placeholder returning False).")
        return False
