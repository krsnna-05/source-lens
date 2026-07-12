"""API v1 endpoints."""

from fastapi import APIRouter

from app.api.v1.health import router as health_router

router = APIRouter(prefix="/v1")
router.include_router(health_router)

__all__ = ["router"]
