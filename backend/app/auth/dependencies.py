"""FastAPI dependencies for extracting the authenticated user from a JWT."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import InvalidTokenError, decode_token
from app.database import get_db_session
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Resolve the authenticated user from the `Authorization: Bearer` header.

    Args:
        credentials: Bearer credentials extracted by FastAPI's security scheme.
        db: Database session.

    Returns:
        User: The authenticated user.

    Raises:
        HTTPException: 401 if the token is missing, invalid, expired, not an
            access token, or no longer maps to an existing user.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        payload = decode_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user = await db.get(User, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
