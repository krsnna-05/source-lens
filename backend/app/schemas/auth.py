"""Auth request/response schemas."""

from pydantic import BaseModel

from app.schemas.user import UserRead


class GitHubCallbackRequest(BaseModel):
    """Payload sent by the frontend after GitHub redirects back with a code."""

    code: str
    state: str


class AuthResponse(BaseModel):
    """JWT session issued after a successful GitHub sign-in."""

    access_token: str
    token_type: str = "bearer"
    user: UserRead
