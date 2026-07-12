"""Application configuration using Pydantic v2."""

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "SourceLens"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = False

    # Database Configuration
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # GitHub OAuth
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str = "http://localhost:3000/auth/callback"

    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 7

    # Embedding Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_DIMENSION: int = 384

    # LLM Configuration
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = Field(default="mistral", validation_alias="LLM_MODEL")

    # Indexing Configuration
    INDEXING_MAX_WORKERS: int = 4
    INDEXING_TIMEOUT_SECONDS: int = 3600
    INDEXING_BATCH_SIZE: int = 100
    CHUNK_SIZE: int = 1024
    CHUNK_OVERLAP: int = 128

    # Retrieval Configuration
    RETRIEVAL_TOP_K: int = 10
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.5
    RETRIEVAL_RERANK_TOP_K: int = 5

    # File System Configuration
    TEMP_DIR: str = "/tmp/sourcelens"
    REPO_STORAGE_DIR: str = "/var/sourcelens/repos"

    # Sentry Configuration
    SENTRY_DSN: str = ""

    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()
