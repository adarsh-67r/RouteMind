"""
Schemas package entry point.
Exposes data validation models for external import.
"""

from app.schemas.chat import ChatRequest, ChatResponse

__all__ = ["ChatRequest", "ChatResponse"]
