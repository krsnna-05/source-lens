"""Repository persistence logic for the add-repo flow.

Cloning and indexing are not implemented yet — adding a repository just
persists a row with `status=PENDING` for a future indexing job to pick up.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.repository import Repository, RepositoryProvider, RepositoryStatus


async def get_or_create_repository(
    db: AsyncSession,
    user_id: int,
    name: str,
    owner: str,
    url: str,
    default_branch: str,
    provider: RepositoryProvider,
) -> Repository:
    """Return the user's existing repository row, or create one as PENDING.

    Args:
        db: Active async database session.
        user_id: Owning user's id.
        name: Repository name (without owner).
        owner: Repository owner/organization login.
        url: Repository URL.
        default_branch: Repository's default branch.
        provider: Where the repository is hosted.

    Returns:
        Repository: The existing or newly created repository row.
    """
    result = await db.execute(
        select(Repository).where(
            Repository.user_id == user_id,
            Repository.owner == owner,
            Repository.name == name,
        )
    )
    repository = result.scalar_one_or_none()
    if repository is not None:
        return repository

    repository = Repository(
        user_id=user_id,
        name=name,
        owner=owner,
        url=url,
        provider=provider,
        default_branch=default_branch,
        status=RepositoryStatus.PENDING,
    )
    db.add(repository)
    await db.commit()
    await db.refresh(repository)
    return repository


async def list_user_repositories(db: AsyncSession, user_id: int) -> list[Repository]:
    """List all repositories the user has added, most recently created first."""
    result = await db.execute(
        select(Repository)
        .where(Repository.user_id == user_id)
        .order_by(Repository.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_repository(db: AsyncSession, user_id: int, repository_id: uuid.UUID) -> bool:
    """Delete a repository owned by the user.

    Args:
        db: Active async database session.
        user_id: Owning user's id, to prevent deleting another user's repository.
        repository_id: Repository to delete.

    Returns:
        bool: True if a repository was deleted, False if none matched.
    """
    result = await db.execute(
        select(Repository).where(Repository.id == repository_id, Repository.user_id == user_id)
    )
    repository = result.scalar_one_or_none()
    if repository is None:
        return False

    await db.delete(repository)
    await db.commit()
    return True
