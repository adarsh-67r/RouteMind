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
        examples=["What is the runtime complexity of bubble sort?"],
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for the chat conversation thread.",
        examples=["conv_8f3a9e2d"],
    )
    routing_policy: Literal["balanced", "speed", "cost", "quality"] = Field(
        default="balanced",
        description="The routing policy preference to optimize AI model selection.",
        examples=["quality"],
    )
    attachments: Optional[List[str]] = Field(
        default=None,
        description="Optional list of attachment URLs or base64 resource identifiers associated with the message.",
        examples=[["https://example.com/image.png"]],
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for the user initiating the request.",
        examples=["usr_9x12bc8f"],
    )
    timestamp: Optional[str] = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 formatted UTC timestamp of when the request was initiated.",
        examples=["2026-06-25T15:41:00Z"],
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


class ResponseDetail(BaseModel):
    """
    Details of the generated AI completion response.
    """

    content: str = Field(
        ...,
        description="The generated textual response from the selected AI model.",
        examples=["Bubble sort has a worst-case runtime complexity of O(n^2)."],
    )
    conversation_id: str = Field(
        ...,
        description="The conversation identifier associated with this response.",
        examples=["conv_8f3a9e2d"],
    )
    attachments: Optional[List[str]] = Field(
        default=None,
        description="Optional list of attachments that were associated with this response.",
        examples=[["https://example.com/output.png"]],
    )


class RoutingDetail(BaseModel):
    """
    Explainability data and routing performance metrics for the decision.
    """

    intent: str = Field(
        ...,
        description="The classified intent/category of the message.",
        examples=["coding"],
    )
    provider: str = Field(
        ...,
        description="The AI provider hosting the selected model.",
        examples=["openai"],
    )
    selected_model: str = Field(
        ...,
        description="The specific AI model that processed the request.",
        examples=["gpt-4o"],
    )
    routing_policy: str = Field(
        ...,
        description="The optimization policy requested by the user.",
        examples=["quality"],
    )
    confidence: float = Field(
        ...,
        description="The confidence score (0.0 to 100.0) of the classification or routing decision.",
        examples=[95.0],
        ge=0.0,
        le=100.0,
    )
    reason: str = Field(
        ...,
        description="Explaining rationale for why this model and provider were selected.",
        examples=[
            "Selected GPT-4o for high-quality reasoning requested in routing policy."
        ],
    )
    estimated_cost: float = Field(
        ...,
        description="Estimated token cost of this operation in USD.",
        examples=[0.0015],
        ge=0.0,
    )
    processing_time_ms: int = Field(
        ...,
        description="The total processing latency in milliseconds.",
        examples=[342],
        ge=0,
    )


class MetadataDetail(BaseModel):
    """
    Diagnostic diagnostic metadata relating to the API request execution.
    """

    request_id: str = Field(
        ...,
        description="Unique identifier dynamically generated for this request execution.",
        examples=["req_d3f28a9b7"],
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 UTC timestamp of when the response was generated.",
        examples=["2026-06-25T15:41:00Z"],
    )
    status: str = Field(
        default="success",
        description="Status string indicating success or partial failure of the execution.",
        examples=["success"],
    )
    api_version: str = Field(
        ...,
        description="The version of the RouteMind API processing the request.",
        examples=["1.0.0"],
    )


class ChatResponse(BaseModel):
    """
    Nested schema structure for the response returned by RouteMind.
    Divided into response content, explainability routing metrics, and call metadata.
    """

    response: ResponseDetail = Field(
        ..., description="Contains AI response information."
    )
    routing: RoutingDetail = Field(
        ..., description="Contains RouteMind's explainability data."
    )
    metadata: MetadataDetail = Field(..., description="Contains backend metadata.")
