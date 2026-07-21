"""User persistence logic backing the authentication flow."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.oauth import GitHubProfile
from app.models.user import User


async def upsert_github_user(db: AsyncSession, profile: GitHubProfile, access_token: str) -> User:
    """Create a user from a GitHub profile, or update an existing one.

    Matches on `github_id`. Existing users have their access token and any
    changed profile fields (username, email, avatar) refreshed.

    Args:
        db: Active async database session.
        profile: Normalized GitHub profile fields.
        access_token: GitHub access token to persist for the user.

    Returns:
        User: The created or updated user row.
    """
    result = await db.execute(select(User).where(User.github_id == profile["github_id"]))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            github_id=profile["github_id"],
            username=profile["username"],
            email=profile["email"],
            avatar_url=profile["avatar_url"],
            access_token=access_token,
        )
        db.add(user)
    else:
        user.username = profile["username"]
        user.email = profile["email"]
        user.avatar_url = profile["avatar_url"]
        user.access_token = access_token

    await db.commit()
    await db.refresh(user)
    return user
