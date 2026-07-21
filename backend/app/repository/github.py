"""Listing a user's own GitHub repositories, one page at a time."""

from typing import Any, TypedDict

import httpx

GITHUB_USER_REPOS_URL = "https://api.github.com/user/repos"


class GitHubRepoError(Exception):
    """Raised when fetching the user's GitHub repositories fails."""


class GitHubRepo(TypedDict):
    """A single repository as returned to the frontend."""

    id: int
    name: str
    full_name: str
    private: bool
    default_branch: str
    updated_at: str
    html_url: str


class GitHubRepoPage(TypedDict):
    """One page of the user's repositories, plus whether more remain."""

    repos: list[GitHubRepo]
    has_more: bool


async def list_user_repos_page(access_token: str, page: int, per_page: int) -> GitHubRepoPage:
    """Fetch a single page of repositories the user owns, collaborates on, or belongs to.

    Args:
        access_token: The user's stored GitHub access token.
        page: 1-indexed page number.
        per_page: Repositories per page (GitHub caps this at 100).

    Returns:
        GitHubRepoPage: The page's repositories and whether a next page exists,
            determined from GitHub's `Link` response header.

    Raises:
        GitHubRepoError: If GitHub is unreachable or rejects the request
            (e.g. the stored access token was revoked).
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                GITHUB_USER_REPOS_URL,
                headers=headers,
                params={
                    "per_page": per_page,
                    "page": page,
                    "sort": "updated",
                    "affiliation": "owner,collaborator,organization_member",
                },
            )
    except httpx.HTTPError as exc:
        raise GitHubRepoError("Could not reach GitHub to list repositories") from exc

    if response.status_code != 200:
        raise GitHubRepoError("Failed to fetch repositories from GitHub")

    batch: list[dict[str, Any]] = response.json()
    repos = [
        GitHubRepo(
            id=item["id"],
            name=item["name"],
            full_name=item["full_name"],
            private=item["private"],
            default_branch=item["default_branch"],
            updated_at=item["updated_at"],
            html_url=item["html_url"],
        )
        for item in batch
    ]

    return GitHubRepoPage(repos=repos, has_more="next" in response.links)
