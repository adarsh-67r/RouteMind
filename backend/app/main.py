"""
Main application entry point for RouteMind Backend.
Configures CORS, registers API routers, sets up basic logging, and defines lifecycle events.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.health import router as health_router
from app.routes.chat import router as chat_router

# Setup basic logging configuration as per standard practices
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("routemind.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for application startup and shutdown.
    Prepares resources or registers logs during the lifecycle.
    """
    logger.info("Starting up RouteMind Backend...")
    # Add future startup logic here (e.g., initializing clients)
    yield
    logger.info("Shutting down RouteMind Backend...")
    # Add future shutdown cleanup here


# Initialize FastAPI application with centralized configuration metadata
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Intelligent AI Orchestration and Routing Platform API.",
    lifespan=lifespan,
)

# Configure CORS Middleware using settings defined in environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(health_router, tags=["System"])
app.include_router(chat_router, tags=["Chat"])
