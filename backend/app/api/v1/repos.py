"""GitHub repository listing endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.dependencies import get_current_user
from app.models.user import User
from app.repository.github import GitHubRepoError, list_user_repos_page
from app.schemas.repository import GitHubRepoPageRead, GitHubRepoRead

router = APIRouter(prefix="/repos", tags=["repositories"])


@router.get("/github", response_model=GitHubRepoPageRead)
async def list_github_repos(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
) -> GitHubRepoPageRead:
    """List a page of the authenticated user's GitHub repositories.

    Args:
        page: 1-indexed page number.
        per_page: Repositories per page (max 100).
        user: The authenticated user, resolved from the bearer token.

    Returns:
        GitHubRepoPageRead: The requested page, most recently updated first,
            and whether a further page is available.

    Raises:
        HTTPException: 502 if GitHub can't be reached or rejects the request.
    """
    try:
        result = await list_user_repos_page(user.access_token, page=page, per_page=per_page)
    except GitHubRepoError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return GitHubRepoPageRead(
        repos=[GitHubRepoRead(**repo) for repo in result["repos"]],
        has_more=result["has_more"],
        next_page=page + 1 if result["has_more"] else None,
    )
