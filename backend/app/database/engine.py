"""Database engine and session factory configuration."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core import settings

# Create async engine with appropriate pooling strategy
if settings.ENVIRONMENT == "production":
    # Use NullPool in production for better connection handling in serverless/docker
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )
else:
    # Use default pool with echo in development/staging for debugging
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.API_DEBUG,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
    )

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async generator for dependency injection of database sessions.

    Yields database sessions that are automatically closed after use.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
