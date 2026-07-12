"""FastAPI application factory and setup."""

import logging
from contextlib import asynccontextmanager
from typing import Any

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app
from app.api import router as api_router
from app.core.config import settings

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> Any:
    """Manage application startup and shutdown events.

    Args:
        app: FastAPI application instance.

    Yields:
        None
    """
    # Startup
    logger.info(f"Starting SourceLens in {settings.ENVIRONMENT} mode")

    yield

    # Shutdown
    logger.info("Shutting down SourceLens")


def create_app() -> FastAPI:
    """Create and configure FastAPI application instance.

    Returns:
        FastAPI: Configured FastAPI application.
    """
    app_instance = FastAPI(
        title="SourceLens",
        version=app.__version__,
        description="AI-powered repository intelligence platform",
        lifespan=lifespan,
    )

    # Configure CORS middleware
    cors_origins: list[str] = []
    if settings.ENVIRONMENT == "development":
        cors_origins = ["*"]
    else:
        cors_origins = ["https://example.com"]

    app_instance.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app_instance.include_router(api_router)

    return app_instance


# Create global application instance
app_instance = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app_instance",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
