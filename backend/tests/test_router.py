"""
Unit tests for the RouteMind LLM Router.
Tests routing decisions across policies, intent mappings, fallbacks, and error cases.
"""

import pytest
from app.services.router import LLMRouter, RoutingDecision, RoutingError


@pytest.fixture
def router():
    """Creates a fresh router instance for each test."""
    return LLMRouter()


ALL_PROVIDERS = ["openai", "claude", "gemini"]


class TestDirectIntentRouting:
    """Tests that intents map to their preferred providers when available."""

    @pytest.mark.parametrize(
        "intent,expected_provider",
        [
            ("coding", "openai"),
            ("writing", "claude"),
            ("document", "gemini"),
            ("research", "gemini"),
            ("math", "openai"),
            ("image", "openai"),
        ],
    )
    def test_intent_routes_to_preferred_provider(self, router, intent, expected_provider):
        decision = router.select_route(intent, "balanced", ALL_PROVIDERS)
        assert decision.provider == expected_provider
        assert decision.confidence == 95.0

    def test_returns_routing_decision_type(self, router):
        decision = router.select_route("coding", "balanced", ALL_PROVIDERS)
        assert isinstance(decision, RoutingDecision)


class TestPolicyModelSelection:
    """Tests that routing policies select the correct model variant."""

    def test_balanced_policy_openai(self, router):
        decision = router.select_route("coding", "balanced", ALL_PROVIDERS)
        assert decision.model == "gpt-4o-mini"

    def test_quality_policy_openai(self, router):
        decision = router.select_route("coding", "quality", ALL_PROVIDERS)
        assert decision.model == "gpt-4o"

    def test_speed_policy_claude(self, router):
        decision = router.select_route("writing", "speed", ALL_PROVIDERS)
        assert decision.model == "claude-3-5-haiku"

    def test_quality_policy_claude(self, router):
        decision = router.select_route("writing", "quality", ALL_PROVIDERS)
        assert decision.model == "claude-3-5-sonnet"

    def test_speed_policy_gemini(self, router):
        decision = router.select_route("document", "speed", ALL_PROVIDERS)
        assert decision.model == "gemini-1.5-flash"

    def test_quality_policy_gemini(self, router):
        decision = router.select_route("document", "quality", ALL_PROVIDERS)
        assert decision.model == "gemini-1.5-pro"

    def test_cost_policy_selects_cheap_model(self, router):
        decision = router.select_route("coding", "cost", ALL_PROVIDERS)
        assert decision.model == "gpt-4o-mini"


class TestFallbackBehavior:
    """Tests routing fallback when preferred provider is unavailable."""

    def test_fallback_when_preferred_offline(self, router):
        # writing prefers claude, but only openai is available
        decision = router.select_route("writing", "balanced", ["openai"])
        assert decision.provider == "openai"
        assert decision.confidence == 60.0
        assert "offline" in decision.reason.lower() or "fell back" in decision.reason.lower()

    def test_fallback_for_unknown_intent(self, router):
        decision = router.select_route("unknown_category", "balanced", ALL_PROVIDERS)
        assert decision.provider == ALL_PROVIDERS[0]
        assert decision.confidence == 50.0
        assert "no direct mapping" in decision.reason.lower()

    def test_fallback_uses_first_available(self, router):
        decision = router.select_route("writing", "balanced", ["gemini"])
        assert decision.provider == "gemini"

    def test_no_providers_raises_error(self, router):
        with pytest.raises(RoutingError, match="No available providers"):
            router.select_route("coding", "balanced", [])


class TestRoutingDecisionSchema:
    """Tests the shape and content of RoutingDecision output."""

    def test_decision_has_all_fields(self, router):
        decision = router.select_route("coding", "balanced", ALL_PROVIDERS)
        assert decision.provider is not None
        assert decision.model is not None
        assert decision.reason is not None
        assert decision.confidence is not None

    def test_reason_is_descriptive(self, router):
        decision = router.select_route("coding", "balanced", ALL_PROVIDERS)
        assert len(decision.reason) > 10

    def test_confidence_within_range(self, router):
        decision = router.select_route("coding", "balanced", ALL_PROVIDERS)
        assert 0.0 <= decision.confidence <= 100.0


class TestEdgeCases:
    """Edge case coverage for the router."""

    def test_intent_with_extra_whitespace(self, router):
        decision = router.select_route("  coding  ", "balanced", ALL_PROVIDERS)
        assert decision.provider == "openai"

    def test_intent_case_insensitive(self, router):
        decision = router.select_route("CODING", "balanced", ALL_PROVIDERS)
        assert decision.provider == "openai"

    def test_provider_names_case_insensitive(self, router):
        decision = router.select_route("coding", "balanced", ["OpenAI", "Claude"])
        assert decision.provider == "openai"
