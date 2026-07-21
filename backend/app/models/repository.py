"""Repository model and its status/provider/index-mode enums."""

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.indexed_file import IndexedFile


class RepositoryProvider(str, Enum):
    """Where a repository's source lives."""

    GITHUB = "github"
    GITLAB = "gitlab"
    LOCAL = "local"


class RepositoryStatus(str, Enum):
    """Indexing lifecycle state of a repository."""

    PENDING = "pending"
    INDEXING = "indexing"
    READY = "ready"
    FAILED = "failed"


class IndexMode(str, Enum):
    """How a repository is kept up to date after the initial index."""

    MANUAL = "manual"
    AUTO = "auto"


class Repository(Base, TimestampMixin):
    """A repository a user has connected to SourceLens.

    Intentionally small: everything related to files, chunks, symbols, and
    embeddings lives in separate tables (see `IndexedFile`).
    """

    __tablename__ = "repositories"
    __table_args__ = (
        UniqueConstraint("user_id", "owner", "name", name="uq_repositories_user_owner_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    # Repository identity
    name: Mapped[str] = mapped_column(String(255))
    owner: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(500))
    provider: Mapped[RepositoryProvider] = mapped_column(
        SAEnum(
            RepositoryProvider,
            name="repository_provider",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=RepositoryProvider.GITHUB,
    )
    default_branch: Mapped[str] = mapped_column(String(255), default="main")

    # Local checkout, populated once the (future) indexing pipeline clones it.
    local_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # Sync state
    latest_remote_commit: Mapped[str | None] = mapped_column(String(40), nullable=True)
    last_indexed_commit: Mapped[str | None] = mapped_column(String(40), nullable=True)

    # Indexing
    status: Mapped[RepositoryStatus] = mapped_column(
        SAEnum(
            RepositoryStatus,
            name="repository_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=RepositoryStatus.PENDING,
    )
    index_mode: Mapped[IndexMode] = mapped_column(
        SAEnum(
            IndexMode,
            name="index_mode",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=IndexMode.MANUAL,
    )

    last_indexed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    files: Mapped[list["IndexedFile"]] = relationship(
        back_populates="repository", cascade="all, delete-orphan"
    )

    @property
    def is_synced(self) -> bool:
        """Whether the last indexed commit matches the latest known remote commit.

        Computed rather than stored, so it can never drift out of sync with
        the two commit columns it derives from.
        """
        return self.last_indexed_commit == self.latest_remote_commit

    def __repr__(self) -> str:
        """Return a string representation of the Repository."""
        return f"<Repository(id={self.id}, owner={self.owner}, name={self.name}, status={self.status})>"
