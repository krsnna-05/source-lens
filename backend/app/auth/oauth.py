"""GitHub OAuth authorization and profile-exchange helpers."""

from typing import Any, TypedDict
from urllib.parse import urlencode

import httpx

from app.core.config import settings

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_USER_EMAILS_URL = "https://api.github.com/user/emails"

# read:user + user:email cover profile/email; repo is required to read commits
# from both public and private repositories.
GITHUB_OAUTH_SCOPES = "read:user user:email repo"


class GitHubOAuthError(Exception):
    """Raised when the GitHub OAuth code exchange or profile fetch fails."""


class GitHubProfile(TypedDict):
    """Normalized GitHub profile data used to create/update a User."""

    github_id: int
    username: str
    email: str
    avatar_url: str | None


def build_github_authorize_url(state: str) -> str:
    """Build the GitHub OAuth authorization URL for the login redirect.

    Args:
        state: Opaque CSRF token echoed back by GitHub on callback.

    Returns:
        str: Fully-qualified GitHub OAuth authorize URL.
    """
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": GITHUB_OAUTH_SCOPES,
        "state": state,
        "allow_signup": "true",
    }
    return f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code_for_token(code: str) -> str:
    """Exchange a GitHub OAuth authorization code for an access token.

    Args:
        code: The one-time authorization code GitHub redirected back with.

    Returns:
        str: GitHub access token for the authenticated user.

    Raises:
        GitHubOAuthError: If the code is invalid/expired/reused, or GitHub
            is unreachable.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GITHUB_TOKEN_URL,
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"},
            )
    except httpx.HTTPError as exc:
        raise GitHubOAuthError("Could not reach GitHub to exchange the code") from exc

    if response.status_code != 200:
        raise GitHubOAuthError("GitHub token exchange request failed")

    payload: dict[str, Any] = response.json()
    if "error" in payload:
        # e.g. bad_verification_code (invalid/expired/already-used code)
        raise GitHubOAuthError(payload.get("error_description", payload["error"]))

    access_token = payload.get("access_token")
    if not access_token:
        raise GitHubOAuthError("GitHub did not return an access token")
    return str(access_token)


async def fetch_github_profile(access_token: str) -> GitHubProfile:
    """Fetch the authenticated GitHub user's profile and a verified email.

    Args:
        access_token: GitHub access token from `exchange_code_for_token`.

    Returns:
        GitHubProfile: Normalized profile fields for the User model.

    Raises:
        GitHubOAuthError: If the profile can't be fetched or no verified
            email is available for the account.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_response = await client.get(GITHUB_USER_URL, headers=headers)
            if user_response.status_code != 200:
                raise GitHubOAuthError("Failed to fetch GitHub user profile")
            user = user_response.json()

            email = user.get("email")
            if not email:
                emails_response = await client.get(GITHUB_USER_EMAILS_URL, headers=headers)
                if emails_response.status_code == 200:
                    email = _pick_verified_email(emails_response.json())
    except httpx.HTTPError as exc:
        raise GitHubOAuthError("Could not reach GitHub to fetch the profile") from exc

    if not email:
        raise GitHubOAuthError("GitHub account has no verified email address")

    return GitHubProfile(
        github_id=user["id"],
        username=user["login"],
        email=email,
        avatar_url=user.get("avatar_url"),
    )


def _pick_verified_email(emails: list[dict[str, Any]]) -> str | None:
    """Pick the best verified email from GitHub's /user/emails response."""
    primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
    if primary is not None:
        return str(primary["email"])
    verified = next((e for e in emails if e.get("verified")), None)
    return str(verified["email"]) if verified else None
