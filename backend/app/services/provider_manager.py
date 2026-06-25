"""
Provider Manager for RouteMind.
Responsible for registering, instantiating, caching, and health-checking AI providers.
Ensures that components like the Router do not directly instantiate provider classes.
"""

import logging
from typing import Dict, List, Type
from app.providers.base import BaseProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.claude_provider import ClaudeProvider
from app.providers.gemini_provider import GeminiProvider

logger = logging.getLogger("routemind.services.provider_manager")


class ProviderManager:
    """
    Manages the lifecycle of AI providers.
    Uses lazy loading to instantiate provider classes and caches them for subsequent lookups.
    """

    def __init__(self) -> None:
        """
        Initializes the ProviderManager registry with available provider classes.
        """
        self._provider_registry: Dict[str, Type[BaseProvider]] = {
            "openai": OpenAIProvider,
            "claude": ClaudeProvider,
            "gemini": GeminiProvider,
        }
        self._provider_instances: Dict[str, BaseProvider] = {}

    def get_provider(self, name: str) -> BaseProvider:
        """
        Retrieves an instance of the specified provider name.
        Uses lazy loading to construct instances upon request.

        Args:
            name: Lowercase string identifier of the provider.

        Returns:
            An instance of BaseProvider.

        Raises:
            ValueError: If the provider name is unknown.
        """
        normalized_name = name.strip().lower()
        if normalized_name not in self._provider_registry:
            raise ValueError(
                f"Unknown provider: '{name}'. Registered options: {list(self._provider_registry.keys())}"
            )

        if normalized_name not in self._provider_instances:
            logger.info("Initializing provider instance: %s", normalized_name)
            provider_class = self._provider_registry[normalized_name]
            self._provider_instances[normalized_name] = provider_class()

        return self._provider_instances[normalized_name]

    def check_availability(self, name: str) -> bool:
        """
        Verifies if the specified provider is active and healthy.

        Args:
            name: The lowercase name of the provider to test.

        Returns:
            bool: True if provider is healthy and authenticated, False otherwise.
        """
        try:
            provider = self.get_provider(name)
            return provider.health_check()
        except Exception as e:
            logger.error(
                "Health check check failed for provider '%s': %s", name, str(e)
            )
            return False

    def list_registered_providers(self) -> List[str]:
        """
        Returns a list of all registered provider names in the platform.

        Returns:
            List[str]: Names of all registered providers.
        """
        return list(self._provider_registry.keys())

    def get_available_providers(self) -> Dict[str, BaseProvider]:
        """
        Scans all registered providers, checks their health, and returns healthy instances.

        Returns:
            Dict[str, BaseProvider]: Map of provider name to healthy BaseProvider instances.
        """
        available: Dict[str, BaseProvider] = {}
        for name in self._provider_registry:
            if self.check_availability(name):
                try:
                    available[name] = self.get_provider(name)
                except Exception as e:
                    logger.error(
                        "Failed to load available provider '%s': %s", name, str(e)
                    )
        return available
