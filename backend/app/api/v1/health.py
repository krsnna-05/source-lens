"""Health check endpoints."""

from typing import Annotated

from fastapi import APIRouter
from pydantic import BaseModel, Field

import app

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    """Health check response model."""

    status: Annotated[str, Field(description="Service health status")] = "healthy"
    version: Annotated[str, Field(description="API version")]

    model_config = {"json_schema_extra": {"example": {"status": "healthy", "version": "0.1.0"}}}


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check service health and version.

    Returns:
        HealthResponse: Service status and version information.
    """
    return HealthResponse(status="healthy", version=app.__version__)
