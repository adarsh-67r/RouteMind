"""
Chat routing endpoint orchestrating the RouteMind AI routing pipeline.
"""

import time
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status

from app.config import settings
from app.schemas import ChatRequest, ChatResponse
from app.schemas.chat import ResponseDetail, RoutingDetail, MetadataDetail
from app.classifier import BaseIntentClassifier, RuleBasedIntentClassifier
from app.services import ProviderManager, LLMRouter, RoutingError
from app.providers import ProviderError

logger = logging.getLogger("routemind.routes.chat")
router = APIRouter()


# Dependency Injection Providers
def get_classifier() -> BaseIntentClassifier:
    """Dependency injection helper returning the registered Intent Classifier."""
    return RuleBasedIntentClassifier()


def get_router() -> LLMRouter:
    """Dependency injection helper returning the registered LLMRouter."""
    return LLMRouter()


def get_provider_manager() -> ProviderManager:
    """Dependency injection helper returning the registered ProviderManager."""
    return ProviderManager()


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Process and Route Chat Message",
    description="Accepts user message, classifies intent, routes to optimal provider, and returns the response.",
)
async def process_chat_message(
    request: ChatRequest,
    classifier: BaseIntentClassifier = Depends(get_classifier),
    routing_engine: LLMRouter = Depends(get_router),
    provider_mgr: ProviderManager = Depends(get_provider_manager),
) -> ChatResponse:
    """
    Orchestration controller for the RouteMind pipeline:
    1. Receive & Validate ChatRequest.
    2. Classify intent.
    3. Route to optimal provider using policies.
    4. Fetch provider response (with mock fallback if keys/implementations are missing).
    5. Return structured ChatResponse.
    """
    # Strict validation for whitespace-only messages
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty or consist only of whitespace.",
        )

    start_time = time.perf_counter()
    logger.info(
        "Starting RouteMind orchestration for conversation: %s", request.conversation_id
    )

    # 1. Intent Classification Stage
    try:
        intent_result = classifier.classify(request.message)
        logger.info(
            "Stage 1 [Classifier]: Determined intent '%s' (Confidence: %.2f%%). Reason: %s",
            intent_result.intent,
            intent_result.confidence,
            intent_result.classification_reason,
        )
    except Exception as e:
        logger.error("Stage 1 [Classifier] Failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intent classification failed: {e}",
        )

    # 2. Routing Decision Stage
    try:
        # Use registered providers list for routing calculation resilience
        registered_providers = provider_mgr.list_registered_providers()
        routing_decision = routing_engine.select_route(
            intent=intent_result.intent,
            routing_policy=request.routing_policy,
            available_providers=registered_providers,
        )
        logger.info(
            "Stage 2 [Router]: Route selected: Provider '%s', Model '%s'. Reason: %s",
            routing_decision.provider,
            routing_decision.model,
            routing_decision.reason,
        )
    except RoutingError as e:
        logger.error("Stage 2 [Router] Failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Routing decision failed: {e}",
        )
    except Exception as e:
        logger.error("Stage 2 [Router] Unexpected Failure: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected routing error occurred: {e}",
        )

    # 3. Provider Resolution & Execution Stage
    try:
        provider = provider_mgr.get_provider(routing_decision.provider)
        logger.info(
            "Stage 3 [Provider Manager]: Resolved provider instance for '%s'",
            routing_decision.provider,
        )
    except ValueError as e:
        logger.error(
            "Stage 3 [Provider Manager] Failed to resolve provider: %s", str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider requested: {e}",
        )

    # 4. Generate Response Stage
    provider_response: Dict[str, Any] = {}
    try:
        logger.info(
            "Stage 4 [Provider Call]: Invoking %s.generate_response()",
            routing_decision.provider,
        )
        provider_response = provider.generate_response(
            prompt=request.message, model=routing_decision.model
        )
    except (ProviderError, NotImplementedError) as e:
        # For now providers should still return mock responses since real APIs are not connected.
        # We catch missing API keys or unimplemented placeholders and return structured mock data.
        logger.warning(
            "Stage 4 [Provider Call]: Downstream call to %s failed (%s). Falling back to mock response.",
            routing_decision.provider,
            str(e),
        )
        # Standardized mock dictionary mapping
        provider_response = {
            "response": (
                f"[Mock Response from {routing_decision.provider.upper()}]\n\n"
                f'You asked: "{request.message}"\n\n'
                f"This prompt was classified as '{intent_result.intent}' (confidence: {intent_result.confidence}%) "
                f"and routed to {routing_decision.provider.upper()} using the '{request.routing_policy}' policy."
            ),
            "selected_model": routing_decision.model,
            "provider": routing_decision.provider,
            "latency_ms": (time.perf_counter() - start_time) * 1000,
            "usage": {
                "prompt_tokens": len(request.message) // 4,
                "completion_tokens": 50,
                "total_tokens": (len(request.message) // 4) + 50,
            },
        }
    except Exception as e:
        logger.error("Stage 4 [Provider Call] Unexpected failure: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Bad Gateway: Downstream execution error: {e}",
        )

    # 5. Response Packaging
    total_processing_time = int((time.perf_counter() - start_time) * 1000)

    # Calculate dummy cost based on tokens
    tokens = provider_response.get("usage", {}).get("total_tokens", 0)
    estimated_cost = round(tokens * 0.000015, 6)

    logger.info(
        "Stage 5 [Pipeline Finished]: Successfully routed and processed. Total Latency: %d ms",
        total_processing_time,
    )

    response_detail = ResponseDetail(
        content=provider_response.get("response", ""),
        conversation_id=request.conversation_id or "conv_routed_default",
        attachments=request.attachments,
    )

    routing_detail = RoutingDetail(
        intent=intent_result.intent,
        provider=provider_response.get("provider", routing_decision.provider),
        selected_model=provider_response.get("selected_model", routing_decision.model),
        routing_policy=request.routing_policy,
        confidence=intent_result.confidence,
        reason=routing_decision.reason,
        estimated_cost=estimated_cost,
        processing_time_ms=total_processing_time,
    )

    metadata_detail = MetadataDetail(
        request_id=f"req_{uuid.uuid4().hex[:12]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        status="success",
        api_version=settings.VERSION,
    )

    return ChatResponse(
        response=response_detail, routing=routing_detail, metadata=metadata_detail
    )


# ----------------------------------------------------------------------
# DATA FLOW EXPLANATION
# ----------------------------------------------------------------------
# The RouteMind data flows through the backend pipeline as follows:
#
# 1. Input Ingestion & Validation:
#    FastAPI receives the client HTTP POST payload and validates it against the `ChatRequest` schema.
#
# 2. Intent Classification:
#    The raw prompt message string is passed to `RuleBasedIntentClassifier.classify()`.
#    Heuristic rules analyze keywords and return an `IntentResult` (intent type, confidence, matches).
#
# 3. Provider Routing:
#    The `LLMRouter` consumes the classified intent, the client's routing policy, and the active
#    provider names. It determines the target provider and model, returning a `RoutingDecision`.
#
# 4. Provider Selection:
#    The `ProviderManager` matches the selected provider name to its adapter class and returns
#    a cached instance (lazy-loading it if necessary).
#
# 5. Model Execution:
#    The controller calls `provider.generate_response()`. If external APIs are unavailable or
#    unimplemented, the controller gracefully falls back to a structured mock text generator.
#
# 6. Response Serialization:
#    The controller wraps the response, selected model, routing metrics, and calculated costs
#    into a `ChatResponse` schema which FastAPI automatically parses and returns as standard JSON.
# ----------------------------------------------------------------------
