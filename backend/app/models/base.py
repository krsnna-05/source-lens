"""Base SQLAlchemy ORM models and mixins."""

from datetime import datetime
from typing import Any

from sqlalchemy.orm import declarative_base, Mapped, mapped_column


Base = declarative_base()


class TimestampMixin:
    """Mixin that adds created_at and updated_at timestamp fields to models."""

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )
