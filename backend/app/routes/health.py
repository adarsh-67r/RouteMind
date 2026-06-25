"""
Health check endpoint for monitoring application status.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

# Create a clean APIRouter instance for health endpoints
router = APIRouter()


class HealthResponse(BaseModel):
    """
    Schema representing the structure of the health check response.
    """

    status: str
    service: str
    version: str


@router.get(
    "/",
    summary="Root Welcome Endpoint",
    description="Welcome message and pointer to Swagger API documentation.",
)
async def read_root():
    """
    Root endpoint returning a friendly greeting and directions to docs.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} API. Please navigate to /docs for interactive documentation.",
        "status": "online",
    }


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Get Service Health Status",
    description="Returns the current operational status of the RouteMind API.",
)
async def get_health() -> HealthResponse:
    """
    Health check handler returning application version and status.
    """
    return HealthResponse(
        status="healthy", service=settings.APP_NAME, version=settings.VERSION
    )
