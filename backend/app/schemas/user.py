"""User request and response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    github_id: int
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None
    access_token: str


class UserRead(BaseModel):
    """Schema for reading user data."""

    id: int
    github_id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
