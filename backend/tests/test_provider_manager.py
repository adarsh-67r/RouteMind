"""
Unit tests for the RouteMind Provider Manager.
Tests provider registration, lazy loading, caching, health checking, and error handling.
"""

import pytest
from app.services.provider_manager import ProviderManager
from app.providers.base import BaseProvider


@pytest.fixture
def manager():
    """Creates a fresh ProviderManager for each test."""
    return ProviderManager()


class TestProviderRegistration:
    """Tests for provider registration and discovery."""

    def test_lists_all_registered_providers(self, manager):
        providers = manager.list_registered_providers()
        assert "openai" in providers
        assert "claude" in providers
        assert "gemini" in providers

    def test_registered_provider_count(self, manager):
        providers = manager.list_registered_providers()
        assert len(providers) == 3


class TestProviderResolution:
    """Tests for getting provider instances."""

    def test_get_known_provider(self, manager):
        provider = manager.get_provider("openai")
        assert isinstance(provider, BaseProvider)

    def test_get_unknown_provider_raises(self, manager):
        with pytest.raises(ValueError, match="Unknown provider"):
            manager.get_provider("nonexistent")

    def test_provider_name_normalized(self, manager):
        provider = manager.get_provider("  OpenAI  ")
        assert isinstance(provider, BaseProvider)


class TestLazyCaching:
    """Tests that provider instances are lazily loaded and cached."""

    def test_same_instance_returned(self, manager):
        p1 = manager.get_provider("openai")
        p2 = manager.get_provider("openai")
        assert p1 is p2

    def test_different_providers_different_instances(self, manager):
        p1 = manager.get_provider("openai")
        p2 = manager.get_provider("claude")
        assert p1 is not p2


class TestProviderNames:
    """Tests for provider_name() on resolved instances."""

    def test_openai_provider_name(self, manager):
        provider = manager.get_provider("openai")
        assert provider.provider_name() == "openai"

    def test_claude_provider_name(self, manager):
        provider = manager.get_provider("claude")
        assert provider.provider_name() == "claude"

    def test_gemini_provider_name(self, manager):
        provider = manager.get_provider("gemini")
        assert provider.provider_name() == "gemini"


class TestHealthChecks:
    """Tests for provider health checking behavior."""

    def test_unavailable_claude_returns_false(self, manager):
        # Claude is a placeholder and always returns False for health_check
        assert manager.check_availability("claude") is False

    def test_unavailable_gemini_returns_false(self, manager):
        # Gemini is a placeholder and always returns False for health_check
        assert manager.check_availability("gemini") is False

    def test_unknown_provider_returns_false(self, manager):
        assert manager.check_availability("does_not_exist") is False
