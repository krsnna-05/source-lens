"""FastAPI application factory and setup."""

import logging
from contextlib import asynccontextmanager
from typing import Any

import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
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
        version=__version__,
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
app = create_app()


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint for quick API discovery."""
    return {
        "name": "SourceLens API",
        "docs": "/docs",
        "health": "/api/health/",
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    """Avoid browser favicon 404 noise."""
    return Response(status_code=204)


# Backward-compatible alias used by existing Docker/README commands
app_instance = app


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
