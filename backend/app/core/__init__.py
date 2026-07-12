"""Core configuration and constants."""

from app.core.config import settings
from app.core.constants import (
    API_VERSION,
    IGNORED_DIRS,
    MAX_FILE_SIZE,
    SUPPORTED_EXTENSIONS,
)

__all__ = [
    "settings",
    "SUPPORTED_EXTENSIONS",
    "MAX_FILE_SIZE",
    "IGNORED_DIRS",
    "API_VERSION",
]
