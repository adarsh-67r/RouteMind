"""
Chat routing endpoint representing the entry point for AI orchestration.
Refactored to use independent schemas for request/response models.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas import ChatRequest, ChatResponse

# Create a clean APIRouter instance for chat endpoints
router = APIRouter()

@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Process and Route Chat Message",
    description="Accepts user message, performs mock routing, and returns the response."
)
async def process_chat_message(request: ChatRequest) -> ChatResponse:
    """
    Mock chat routing handler. Validate input and return standard placeholder response.
    """
    # Reject empty or whitespace-only messages explicitly with HTTP 400
    # Note: Pydantic field validator also handles this, but we preserve the HTTP 400 for strict backward compatibility.
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty or consist only of whitespace."
        )
        
    return ChatResponse(
        response="Chat endpoint working",
        selected_model="Mock Router",
        provider="Mock Provider",
        reason="Backend placeholder",
        confidence=100.0,
        processing_time_ms=42,
        estimated_cost=0.0,
        conversation_id=request.conversation_id or "conv_mock_default"
    )

