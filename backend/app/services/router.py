"""
Routing Engine for RouteMind.
Analyzes intent, policy, and active provider availability to decide the optimal target.
"""

from typing import Dict, List, Literal
from pydantic import BaseModel, Field


class RoutingError(Exception):
    """Raised when the routing engine is unable to make a valid routing decision."""

    pass


class RoutingDecision(BaseModel):
    """
    Represents the output of a routing decision.
    """

    provider: str = Field(
        ..., description="The name of the selected provider (e.g., 'openai')."
    )
    model: str = Field(..., description="The model assigned to handle the task.")
    reason: str = Field(..., description="Explanation of why this choice was made.")
    confidence: float = Field(
        ..., description="Confidence score for this decision (0.0 to 100.0)."
    )


class LLMRouter:
    """
    Decoupled routing engine that applies rule-based routing to select providers.
    Does not instantiate or import provider implementations directly.
    """

    def __init__(self) -> None:
        # Static mapping from intent to preferred provider name
        self._intent_mapping: Dict[str, str] = {
            "coding": "openai",
            "writing": "claude",
            "document": "gemini",
            "research": "gemini",
            "math": "openai",
            "image": "openai",
        }

        # Default model configurations by provider name and policy type
        self._model_policy_mapping: Dict[str, Dict[str, str]] = {
            "openai": {
                "balanced": "gpt-4o-mini",
                "speed": "gpt-4o-mini",
                "cost": "gpt-4o-mini",
                "quality": "gpt-4o",
            },
            "claude": {
                "balanced": "claude-3-5-sonnet",
                "speed": "claude-3-5-haiku",
                "cost": "claude-3-5-haiku",
                "quality": "claude-3-5-sonnet",
            },
            "gemini": {
                "balanced": "gemini-1.5-flash",
                "speed": "gemini-1.5-flash",
                "cost": "gemini-1.5-flash",
                "quality": "gemini-1.5-pro",
            },
        }
        self._default_provider = "openai"

    def select_route(
        self,
        intent: str,
        routing_policy: Literal["balanced", "speed", "cost", "quality"],
        available_providers: List[str],
    ) -> RoutingDecision:
        """
        Calculates the optimal target provider and model based on rules and health list.

        Args:
            intent: The recognized user intent (e.g., 'coding', 'writing').
            routing_policy: Optimization criteria ('balanced', 'speed', 'cost', 'quality').
            available_providers: List of healthy provider names.

        Returns:
            RoutingDecision object.

        Raises:
            RoutingError: If no provider is available to process the request.
        """
        if not available_providers:
            raise RoutingError("No available providers are active or healthy.")

        normalized_available = [p.lower() for p in available_providers]
        preferred_provider = self._intent_mapping.get(intent.strip().lower())

        # Determine selection and fallback
        if preferred_provider and preferred_provider in normalized_available:
            selected_provider = preferred_provider
            reason = f"Intent '{intent}' mapped directly to preferred provider '{selected_provider}'."
            confidence = 95.0
        else:
            # Fallback scenario
            selected_provider = normalized_available[0]
            if preferred_provider:
                reason = (
                    f"Preferred provider '{preferred_provider}' for intent '{intent}' is offline. "
                    f"Fell back to '{selected_provider}'."
                )
                confidence = 60.0
            else:
                reason = (
                    f"No direct mapping for intent '{intent}'. "
                    f"Routed to default fallback provider '{selected_provider}'."
                )
                confidence = 50.0

        # Retrieve mapped model name based on policy
        provider_policies = self._model_policy_mapping.get(selected_provider, {})
        selected_model = provider_policies.get(routing_policy, "default")

        return RoutingDecision(
            provider=selected_provider,
            model=selected_model,
            reason=reason,
            confidence=confidence,
        )
