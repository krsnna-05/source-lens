"""Repository listing schemas."""

from pydantic import BaseModel


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
