"""GitHub OAuth authentication endpoints."""

import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import InvalidTokenError, create_access_token, create_refresh_token, decode_token
from app.auth.oauth import (
    GitHubOAuthError,
    build_github_authorize_url,
    exchange_code_for_token,
    fetch_github_profile,
)
from app.core.config import settings
from app.database import get_db_session
from app.models.user import User
from app.schemas.auth import AuthResponse, GitHubCallbackRequest
from app.schemas.user import UserRead
from app.services.user_service import upsert_github_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

OAUTH_STATE_COOKIE = "oauth_state"
REFRESH_TOKEN_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, user_id: int) -> None:
    """Set (or rotate) the httponly refresh token cookie for a user."""
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=create_refresh_token(user_id),
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60,
        path="/api/auth",
    )


@router.get("/github/login")
async def github_login() -> RedirectResponse:
    """Redirect the user to GitHub's OAuth authorization page.

    A random state token is generated and stashed in an httponly cookie so
    the callback endpoint can verify it against the value GitHub echoes
    back and reject CSRF attempts.

    Returns:
        RedirectResponse: 307 redirect to GitHub's authorize page.
    """
    state = secrets.token_urlsafe(24)
    redirect = RedirectResponse(url=build_github_authorize_url(state), status_code=307)
    redirect.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=600,
    )
    return redirect


@router.post("/github/callback", response_model=AuthResponse)
async def github_callback(
    payload: GitHubCallbackRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    """Exchange a GitHub OAuth code for a session.

    Verifies the CSRF state, exchanges the code for a GitHub access token,
    fetches the GitHub profile, and creates the user or updates their stored
    access token if they already exist. Issues a JWT session on success.

    Args:
        payload: The `code`/`state` pair the frontend received from GitHub.
        request: Used to read the `oauth_state` cookie set at login time.
        response: Used to clear the state cookie and set the refresh cookie.
        db: Database session.

    Returns:
        AuthResponse: JWT access token and the signed-in user.

    Raises:
        HTTPException: 400 if the state is missing/invalid or GitHub
            rejects the code/profile fetch; 409 if the resulting profile
            conflicts with a different existing account.
    """
    cookie_state = request.cookies.get(OAUTH_STATE_COOKIE)
    response.delete_cookie(OAUTH_STATE_COOKIE)

    if not cookie_state or cookie_state != payload.state:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")

    try:
        github_access_token = await exchange_code_for_token(payload.code)
        profile = await fetch_github_profile(github_access_token)
    except GitHubOAuthError as exc:
        logger.warning("GitHub OAuth exchange failed: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        user = await upsert_github_user(db, profile, github_access_token)
    except IntegrityError as exc:
        await db.rollback()
        logger.warning("GitHub user upsert conflict for github_id=%s", profile["github_id"])
        raise HTTPException(
            status_code=409,
            detail="An account with this email or username already exists",
        ) from exc

    _set_refresh_cookie(response, user.id)

    return AuthResponse(
        access_token=create_access_token(user.id),
        user=UserRead.model_validate(user),
    )


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    """Clear the refresh token cookie so a reload can't restore the session."""
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")


@router.post("/refresh", response_model=AuthResponse)
async def refresh_session(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    """Mint a new access token from the httponly refresh token cookie.

    Called on app load to restore a session after a page reload, since the
    access token itself is only kept in memory on the frontend. Rotates the
    refresh token cookie on every successful call.

    Args:
        request: Used to read the `refresh_token` cookie.
        response: Used to rotate the refresh token cookie.
        db: Database session.

    Returns:
        AuthResponse: A fresh JWT access token and the current user.

    Raises:
        HTTPException: 401 if the cookie is missing, invalid, expired, not
            a refresh token, or no longer matches an existing user.
    """
    refresh_cookie = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_cookie:
        raise HTTPException(status_code=401, detail="No active session")

    try:
        payload = decode_token(refresh_cookie)
    except InvalidTokenError as exc:
        response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")
        raise HTTPException(status_code=401, detail="Session expired, please sign in again") from exc

    if payload.get("type") != "refresh":
        response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")
        raise HTTPException(status_code=401, detail="Invalid session token")

    user = await db.get(User, int(payload["sub"]))
    if user is None:
        response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")
        raise HTTPException(status_code=401, detail="Account no longer exists")

    _set_refresh_cookie(response, user.id)

    return AuthResponse(
        access_token=create_access_token(user.id),
        user=UserRead.model_validate(user),
    )
