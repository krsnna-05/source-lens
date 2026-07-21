"""Repository schemas: GitHub browsing, and the persisted Repository entity."""

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.repository import IndexMode, RepositoryProvider, RepositoryStatus


class GitHubRepoRead(BaseModel):
    """A GitHub repository as returned to the frontend."""

    id: int
    name: str
    full_name: str
    private: bool
    default_branch: str
    updated_at: str
    html_url: str


class GitHubRepoPageRead(BaseModel):
    """One page of a user's GitHub repositories."""

    repos: list[GitHubRepoRead]
    has_more: bool
    next_page: int | None


class RepositoryCreate(BaseModel):
    """Payload to add a repository for the authenticated user."""

    name: str
    owner: str
    url: str
    default_branch: str = "main"
    provider: RepositoryProvider = RepositoryProvider.GITHUB


class RepositoryRead(BaseModel):
    """A persisted repository, as returned to the frontend."""

    id: uuid.UUID
    name: str
    owner: str
    url: str
    provider: RepositoryProvider
    default_branch: str
    status: RepositoryStatus
    index_mode: IndexMode
    last_indexed_at: datetime | None
    last_error: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
