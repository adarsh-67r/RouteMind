"""
Pydantic schemas for Chat requests and responses.
Defines production-ready validation, descriptions, and examples.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

class ChatRequest(BaseModel):
    """
    Schema for incoming chat routing requests.
    Validates input parameters and supports customizable routing policy preferences.
    """
    message: str = Field(
        ...,
        min_length=1,
        description="The chat message to analyze and route.",
        examples=["What is the runtime complexity of bubble sort?"]
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for the chat conversation thread.",
        examples=["conv_8f3a9e2d"]
    )
    routing_policy: Literal["balanced", "speed", "cost", "quality"] = Field(
        default="balanced",
        description="The routing policy preference to optimize AI model selection.",
        examples=["quality"]
    )
    attachments: Optional[List[str]] = Field(
        default=None,
        description="Optional list of attachment URLs or base64 resource identifiers associated with the message.",
        examples=[["https://example.com/image.png"]]
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for the user initiating the request.",
        examples=["usr_9x12bc8f"]
    )
    timestamp: Optional[str] = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 formatted UTC timestamp of when the request was initiated.",
        examples=["2026-06-25T15:41:00Z"]
    )

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, value: str) -> str:
        """
        Validate that the message is not just whitespaces.
        """
        if not value.strip():
            raise ValueError("Message cannot be empty or consist only of whitespace.")
        return value


class ChatResponse(BaseModel):
    """
    Schema for the response returned by RouteMind.
    Includes the routed model response and detailed metadata about the selection.
    """
    response: str = Field(
        ...,
        description="The generated textual response from the selected AI model.",
        examples=["Bubble sort has a worst-case runtime complexity of O(n^2)."]
    )
    selected_model: str = Field(
        ...,
        description="The specific AI model that processed the request.",
        examples=["gpt-4o"]
    )
    provider: str = Field(
        ...,
        description="The AI provider hosting the selected model.",
        examples=["openai"]
    )
    reason: str = Field(
        ...,
        description="Explaining rationale for why this model and provider were selected.",
        examples=["Selected GPT-4o for high-quality reasoning requested in routing policy."]
    )
    confidence: float = Field(
        ...,
        description="The confidence score (0.0 to 100.0) of the router's decision.",
        examples=[98.5],
        ge=0.0,
        le=100.0
    )
    processing_time_ms: int = Field(
        ...,
        description="The total time taken in milliseconds to process the request, route, and get response.",
        examples=[342],
        ge=0
    )
    estimated_cost: float = Field(
        ...,
        description="Estimated token cost of this operation in USD.",
        examples=[0.0015],
        ge=0.0
    )
    conversation_id: str = Field(
        ...,
        description="The conversation identifier associated with this response.",
        examples=["conv_8f3a9e2d"]
    )
