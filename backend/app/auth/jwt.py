"""JWT access/refresh token creation and verification."""

from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import jwt

from app.core.config import settings


class InvalidTokenError(Exception):
    """Raised when a JWT is missing, malformed, expired, or fails verification."""


def _create_token(
    subject: str, expires_delta: timedelta, token_type: Literal["access", "refresh"]
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: int) -> str:
    """Create a short-lived JWT access token for the given user."""
    return _create_token(str(user_id), timedelta(hours=settings.JWT_EXPIRATION_HOURS), "access")


def create_refresh_token(user_id: int) -> str:
    """Create a long-lived JWT refresh token for the given user."""
    return _create_token(
        str(user_id), timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS), "refresh"
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT, raising InvalidTokenError on any failure."""
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
