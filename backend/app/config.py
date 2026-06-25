"""
Configuration module for RouteMind Backend.
Centralizes environment variables, CORS settings, and application metadata.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

# Build paths relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from the .env file in the backend root
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseModel):
    """
    Application settings container validated by Pydantic.
    Centralizes all app level configurations.
    """

    APP_NAME: str = os.getenv("APP_NAME", "RouteMind")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    ENV: str = os.getenv("ENV", "development")

    # CORS Origins - parsed as list of strings
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000",
        ).split(",")
        if origin.strip()
    ]

    # Future API Keys placeholders (loaded from environment)
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY") or None
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY") or None
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY") or None


# Global settings instance for import across the codebase
settings = Settings()
