"""Indexed file model — populated by the (future) indexing pipeline."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.repository import Repository


class IndexedFile(Base):
    """A single file captured for a repository during indexing."""

    __tablename__ = "indexed_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE")
    )

    path: Mapped[str] = mapped_column(String(1000))
    blob_sha: Mapped[str] = mapped_column(String(40))
    language: Mapped[str] = mapped_column(String(50))
    size_bytes: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    indexed_at: Mapped[datetime]

    repository: Mapped["Repository"] = relationship(back_populates="files")

    def __repr__(self) -> str:
        """Return a string representation of the IndexedFile."""
        return f"<IndexedFile(id={self.id}, path={self.path})>"
