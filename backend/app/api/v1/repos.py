"""GitHub repository browsing and Repository CRUD endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db_session
from app.models.user import User
from app.repository.github import GitHubRepoError, list_user_repos_page
from app.schemas.repository import (
    GitHubRepoPageRead,
    GitHubRepoRead,
    RepositoryCreate,
    RepositoryRead,
)
from app.services.repository_service import (
    delete_repository,
    get_or_create_repository,
    list_user_repositories,
)

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


@router.post("", response_model=RepositoryRead, status_code=201)
async def add_repository(
    payload: RepositoryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> RepositoryRead:
    """Add a repository for the authenticated user.

    Cloning and indexing are not implemented yet, so the repository is
    persisted with `status=PENDING` for a future indexing job to pick up.
    Adding the same repository twice returns the existing row.

    Args:
        payload: Repository identity to persist.
        user: The authenticated user, resolved from the bearer token.
        db: Database session.

    Returns:
        RepositoryRead: The created (or already-existing) repository.
    """
    repository = await get_or_create_repository(
        db,
        user_id=user.id,
        name=payload.name,
        owner=payload.owner,
        url=payload.url,
        default_branch=payload.default_branch,
        provider=payload.provider,
    )
    return RepositoryRead.model_validate(repository)


@router.get("", response_model=list[RepositoryRead])
async def list_repositories(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[RepositoryRead]:
    """List the authenticated user's added repositories, newest first."""
    repositories = await list_user_repositories(db, user.id)
    return [RepositoryRead.model_validate(repo) for repo in repositories]


@router.delete("/{repository_id}", status_code=204)
async def remove_repository(
    repository_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Remove a repository the authenticated user added.

    Args:
        repository_id: Repository to delete.
        user: The authenticated user, resolved from the bearer token.
        db: Database session.

    Raises:
        HTTPException: 404 if no such repository exists for this user.
    """
    deleted = await delete_repository(db, user_id=user.id, repository_id=repository_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Repository not found")
