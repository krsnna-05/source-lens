"""Application constants."""

# Supported file extensions for indexing
SUPPORTED_EXTENSIONS: set[str] = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".go",
    ".rs",
    ".java",
    ".md",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
}

# Maximum file size (10 MB in bytes)
MAX_FILE_SIZE: int = 10 * 1024 * 1024

# Directories to ignore during repository scanning
IGNORED_DIRS: set[str] = {
    "node_modules",
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "dist",
    "build",
    ".next",
    ".pytest_cache",
    ".mypy_cache",
    "vendor",
}

# API version
API_VERSION: str = "v1"
