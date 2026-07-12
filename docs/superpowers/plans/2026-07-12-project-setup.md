# SourceLens Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize SourceLens with a production-ready project structure for both FastAPI backend and Next.js frontend, complete with dependencies, configuration, and foundational architecture.

**Architecture:** 
- Backend: Modular FastAPI application with clear separation of concerns (auth, chat, repository, indexing, retrieval, llm, embeddings, workers, database)
- Frontend: Next.js App Router with Tailwind CSS, shadcn/ui, and AI SDK integration
- Database: PostgreSQL with pgvector for vector storage (initialized via Docker Compose)
- Both applications configured for development and production with environment-based settings

**Tech Stack:**
- Backend: FastAPI, PostgreSQL, pgvector, SQLAlchemy, Alembic, Tree-sitter, Sentence Transformers, Ollama, GitPython
- Frontend: Next.js, React, AI SDK, Tailwind CSS, shadcn/ui
- Infrastructure: Docker Compose, PostgreSQL, Ollama

## Global Constraints

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Type hints required on all Python code
- Pydantic v2 for validation
- Follow SOLID principles and SourceLens architecture guidelines from CLAUDE.md
- No external dependencies introduced without justification
- Production-quality code from the start

---

## File Structure

### Backend Structure
```
backend/
├── pyproject.toml          # Python project config, dependencies
├── .env.example            # Example environment variables
├── alembic/                # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI application entry point
│   ├── core/               # Core settings, config
│   │   ├── __init__.py
│   │   ├── config.py       # Settings (env-based)
│   │   └── constants.py    # App constants
│   ├── api/                # API routes
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── health.py   # Health check endpoint
│   ├── auth/               # Authentication module
│   │   ├── __init__.py
│   │   └── models.py       # Auth models
│   ├── database/           # Database setup and connection
│   │   ├── __init__.py
│   │   └── engine.py       # SQLAlchemy engine, session
│   ├── models/             # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py         # Base model class
│   │   └── user.py         # User model
│   ├── schemas/            # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   └── user.py
│   ├── utils/              # Utility functions
│   │   ├── __init__.py
│   │   └── logger.py
│   └── services/           # Business logic services
│       ├── __init__.py
│       └── auth.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # Pytest fixtures
│   └── test_health.py
└── migrations/
```

### Frontend Structure
```
frontend/
├── package.json
├── package-lock.json
├── .env.local.example
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── api/            # API routes (if needed)
│   ├── components/         # React components
│   │   └── .gitkeep
│   ├── hooks/              # React hooks
│   │   └── .gitkeep
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client setup
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── .gitkeep
└── public/
    └── .gitkeep
```

### Root Structure
```
.
├── docker-compose.yml      # PostgreSQL + Ollama services
├── .gitignore
├── .git/                   # Git repository
├── README.md               # (already exists)
├── backend/
├── frontend/
└── docs/
    └── superpowers/
        └── plans/
```

---

## Task Breakdown

### Task 1: Initialize Git Repository and Root Configuration

**Files:**
- Create: `.gitignore`
- Create: `docker-compose.yml`
- Create: `.env.example`

**Interfaces:**
- Produces: Git repository with root-level configuration files

- [ ] **Step 1: Initialize git repository**

```bash
cd /home/devkrsna/Projects/sourcelens
git init
```

Expected: Git repository initialized at current location.

- [ ] **Step 2: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/
*.egg-info/
dist/
build/

# Node
node_modules/
.next/
out/
build/
dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite
*.sqlite3

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
EOF
```

- [ ] **Step 3: Create docker-compose.yml for local development**

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: sourcelens
      POSTGRES_PASSWORD: sourcelens_dev
      POSTGRES_DB: sourcelens_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sourcelens"]
      interval: 10s
      timeout: 5s
      retries: 5

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_MODELS=/root/.ollama/models

volumes:
  postgres_data:
  ollama_data:
EOF
```

- [ ] **Step 4: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Backend
BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql://sourcelens:sourcelens_dev@localhost:5432/sourcelens_db
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET_KEY=your_jwt_secret_key_here
EMBEDDING_MODEL=all-MiniLM-L6-v2
OLLAMA_BASE_URL=http://localhost:11434

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

- [ ] **Step 5: Commit initial setup**

```bash
git add .gitignore docker-compose.yml .env.example
git commit -m "chore: initialize git repository with root configuration"
```

---

### Task 2: Set Up Backend Project Structure and Dependencies

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/.env.example`
- Create: `backend/README.md`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/alembic.ini`
- Create: `backend/app/__init__.py`

**Interfaces:**
- Produces: Python project with all dependencies configured and ready for app setup

- [ ] **Step 1: Create backend directory structure**

```bash
mkdir -p backend/app/{core,api/v1,auth,database,models,schemas,services,utils}
mkdir -p backend/tests
mkdir -p backend/alembic/versions
cd backend
```

- [ ] **Step 2: Create pyproject.toml**

```bash
cat > pyproject.toml << 'EOF'
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "sourcelens"
version = "0.1.0"
description = "AI-powered repository intelligence platform"
requires-python = ">=3.11"
license = {text = "MIT"}

dependencies = [
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "sqlalchemy==2.0.23",
    "psycopg2-binary==2.9.9",
    "pgvector==0.2.1",
    "pydantic==2.5.0",
    "pydantic-settings==2.1.0",
    "alembic==1.13.0",
    "python-dotenv==1.0.0",
    "httpx==0.25.2",
    "PyJWT==2.8.1",
    "GitPython==3.1.40",
    "sentence-transformers==2.2.2",
    "tree-sitter==0.20.4",
    "python-multipart==0.0.6",
]

[project.optional-dependencies]
dev = [
    "pytest==7.4.3",
    "pytest-asyncio==0.21.1",
    "pytest-cov==4.1.0",
    "black==23.12.0",
    "ruff==0.1.8",
    "mypy==1.7.1",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.black]
line-length = 100
target-version = ["py311"]

[tool.ruff]
line-length = 100
target-version = "py311"
EOF
```

- [ ] **Step 3: Create backend/.env.example**

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://sourcelens:sourcelens_dev@localhost:5432/sourcelens_db

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT
JWT_SECRET_KEY=your_jwt_secret_key_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# Embeddings
EMBEDDING_MODEL=all-MiniLM-L6-v2

# LLM
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=mistral

# App
ENVIRONMENT=development
LOG_LEVEL=INFO
EOF
```

- [ ] **Step 4: Create alembic configuration**

```bash
cat > alembic/alembic.ini << 'EOF'
sqlalchemy.url =

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
EOF
```

- [ ] **Step 5: Create alembic/env.py**

```bash
cat > alembic/env.py << 'EOF'
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
from dotenv import load_dotenv

load_dotenv()

config = context.config
fileConfig(config.config_file_name)

database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

target_metadata = None

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = database_url or configuration["sqlalchemy.url"]
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF
```

- [ ] **Step 6: Create app/__init__.py**

```bash
cat > app/__init__.py << 'EOF'
"""SourceLens FastAPI application."""

__version__ = "0.1.0"
EOF
```

- [ ] **Step 7: Create backend README.md**

```bash
cat > README.md << 'EOF'
# SourceLens Backend

FastAPI-based backend for the SourceLens AI repository intelligence platform.

## Setup

1. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL and Ollama:
   ```bash
   docker-compose up -d
   ```

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

See CLAUDE.md for detailed architecture documentation.
EOF
```

- [ ] **Step 8: Commit backend initialization**

```bash
git add backend/
git commit -m "chore: initialize backend project structure with dependencies"
```

---

### Task 3: Create Backend Core Configuration and Database Setup

**Files:**
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/constants.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/database/engine.py`
- Create: `backend/app/database/__init__.py`

**Interfaces:**
- Consumes: pyproject.toml, .env file
- Produces: 
  - `Config` class with environment variables
  - `get_db_session()` async generator for database sessions
  - Database engine initialization

- [ ] **Step 1: Create app/core/config.py**

```bash
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    # App
    APP_NAME: str = "SourceLens"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str
    
    # GitHub OAuth
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 7
    
    # Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = "mistral"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
EOF
```

- [ ] **Step 2: Create app/core/constants.py**

```bash
cat > app/core/constants.py << 'EOF'
# Supported file extensions for code parsing
SUPPORTED_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx",
    ".go", ".rs", ".java", ".md",
    ".json", ".yaml", ".yml", ".toml"
}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Ignored directories in repository scanning
IGNORED_DIRS = {
    "node_modules", ".git", "__pycache__",
    "venv", ".venv", "dist", "build", ".next",
    ".pytest_cache", ".mypy_cache", "vendor"
}

# API version
API_VERSION = "v1"
EOF
```

- [ ] **Step 3: Create app/core/__init__.py**

```bash
cat > app/core/__init__.py << 'EOF'
from .config import settings
from .constants import SUPPORTED_EXTENSIONS, MAX_FILE_SIZE, IGNORED_DIRS

__all__ = [
    "settings",
    "SUPPORTED_EXTENSIONS",
    "MAX_FILE_SIZE",
    "IGNORED_DIRS",
]
EOF
```

- [ ] **Step 4: Create app/database/engine.py**

```bash
cat > app/database/engine.py << 'EOF'
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

# PostgreSQL async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    poolclass=NullPool if settings.ENVIRONMENT == "production" else None,
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db_session() -> AsyncSession:
    """Get database session for dependency injection."""
    async with async_session_maker() as session:
        yield session
EOF
```

- [ ] **Step 5: Create app/database/__init__.py**

```bash
cat > app/database/__init__.py << 'EOF'
from .engine import engine, async_session_maker, get_db_session

__all__ = ["engine", "async_session_maker", "get_db_session"]
EOF
```

- [ ] **Step 6: Commit core configuration**

```bash
git add app/core/ app/database/
git commit -m "feat: add core configuration and database setup"
```

---

### Task 4: Create Base Models and User Model

**Files:**
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/__init__.py`

**Interfaces:**
- Consumes: SQLAlchemy ORM, database engine
- Produces:
  - `Base` declarative class for all ORM models
  - `User` model with id, github_id, email, created_at, updated_at fields

- [ ] **Step 1: Create app/models/base.py**

```bash
cat > app/models/base.py << 'EOF'
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from datetime import datetime
from typing import Any

Base = declarative_base()

class TimestampMixin:
    """Mixin that adds created_at and updated_at columns."""
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
EOF
```

- [ ] **Step 2: Create app/models/user.py**

```bash
cat > app/models/user.py << 'EOF'
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from typing import Optional
from app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    github_id: Mapped[int] = mapped_column(Integer, unique=True)
    username: Mapped[str] = mapped_column(String(255), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    access_token: Mapped[str] = mapped_column(String(500))
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
EOF
```

- [ ] **Step 3: Create app/models/__init__.py**

```bash
cat > app/models/__init__.py << 'EOF'
from .base import Base, TimestampMixin
from .user import User

__all__ = ["Base", "TimestampMixin", "User"]
EOF
```

- [ ] **Step 4: Commit models**

```bash
git add app/models/
git commit -m "feat: add SQLAlchemy ORM models for User"
```

---

### Task 5: Create Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/__init__.py`

**Interfaces:**
- Consumes: Pydantic v2
- Produces:
  - `UserCreate` schema for user creation requests
  - `UserRead` schema for user responses

- [ ] **Step 1: Create app/schemas/user.py**

```bash
cat > app/schemas/user.py << 'EOF'
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    github_id: int
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None
    access_token: str

class UserRead(BaseModel):
    id: int
    github_id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
EOF
```

- [ ] **Step 2: Create app/schemas/__init__.py**

```bash
cat > app/schemas/__init__.py << 'EOF'
from .user import UserCreate, UserRead

__all__ = ["UserCreate", "UserRead"]
EOF
```

- [ ] **Step 3: Commit schemas**

```bash
git add app/schemas/
git commit -m "feat: add Pydantic request/response schemas"
```

---

### Task 6: Create Basic API Endpoints

**Files:**
- Create: `backend/app/api/v1/health.py`
- Create: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/__init__.py`

**Interfaces:**
- Consumes: FastAPI, Pydantic schemas
- Produces:
  - GET `/health` endpoint returning app status
  - Router ready for more endpoints in v1

- [ ] **Step 1: Create app/api/v1/health.py**

```bash
cat > app/api/v1/health.py << 'EOF'
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["health"])

class HealthResponse(BaseModel):
    status: str
    version: str

@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    from app import __version__
    return HealthResponse(status="healthy", version=__version__)
EOF
```

- [ ] **Step 2: Create app/api/v1/__init__.py**

```bash
cat > app/api/v1/__init__.py << 'EOF'
from fastapi import APIRouter
from app.api.v1.health import router as health_router

router = APIRouter(prefix="/v1")
router.include_router(health_router)

__all__ = ["router"]
EOF
```

- [ ] **Step 3: Create app/api/__init__.py**

```bash
cat > app/api/__init__.py << 'EOF'
from fastapi import APIRouter
from app.api.v1 import router as v1_router

router = APIRouter(prefix="/api")
router.include_router(v1_router)

__all__ = ["router"]
EOF
```

- [ ] **Step 4: Commit API endpoints**

```bash
git add app/api/
git commit -m "feat: add health check endpoint"
```

---

### Task 7: Create FastAPI Main Application

**Files:**
- Create: `backend/app/main.py`

**Interfaces:**
- Consumes: FastAPI, all core, api, database modules
- Produces: Uvicorn-ready FastAPI application instance

- [ ] **Step 1: Create app/main.py**

```bash
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import router
import logging

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="AI-powered repository intelligence platform",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else ["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
```

- [ ] **Step 2: Create backend/tests/conftest.py**

```bash
cat > tests/conftest.py << 'EOF'
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Test client for FastAPI app."""
    return TestClient(app)
EOF
```

- [ ] **Step 3: Create backend/tests/test_health.py**

```bash
cat > tests/test_health.py << 'EOF'
def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
EOF
```

- [ ] **Step 4: Commit main FastAPI app**

```bash
git add app/main.py tests/
git commit -m "feat: create FastAPI application with health endpoint"
```

---

### Task 8: Set Up Frontend Project with Next.js

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/next.config.js`
- Create: `frontend/.env.local.example`

**Interfaces:**
- Produces: Next.js project structure with TypeScript, Tailwind CSS, and shadcn/ui ready

- [ ] **Step 1: Create frontend directory structure**

```bash
mkdir -p frontend/src/{app,components,hooks,lib,styles,types}
mkdir -p frontend/public
cd frontend
```

- [ ] **Step 2: Create package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "sourcelens-frontend",
  "version": "0.1.0",
  "description": "AI-powered repository intelligence platform frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "ai": "^2.2.0",
    "@radix-ui/react-slot": "^2.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0"
  }
}
EOF
```

- [ ] **Step 3: Create tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "moduleResolution": "node",
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
EOF
```

- [ ] **Step 4: Create tailwind.config.ts**

```bash
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

export default config
EOF
```

- [ ] **Step 5: Create postcss.config.js**

```bash
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

- [ ] **Step 6: Create next.config.js**

```bash
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
EOF
```

- [ ] **Step 7: Create .env.local.example**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

- [ ] **Step 8: Commit frontend configuration**

```bash
cd ..
git add frontend/
git commit -m "chore: initialize Next.js frontend with TypeScript and Tailwind CSS"
```

---

### Task 9: Create Frontend App Structure

**Files:**
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/public/.gitkeep`

**Interfaces:**
- Consumes: Next.js, TypeScript, Tailwind CSS
- Produces: Working Next.js app with root layout and home page

- [ ] **Step 1: Create frontend/src/styles/globals.css**

```bash
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  @apply border-border;
}

html {
  @apply scroll-smooth;
}

body {
  @apply bg-background text-foreground;
}
EOF
```

- [ ] **Step 2: Create frontend/src/app/layout.tsx**

```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "SourceLens",
  description: "AI-powered repository intelligence platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF
```

- [ ] **Step 3: Create frontend/src/app/page.tsx**

```bash
cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SourceLens</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          AI-powered repository intelligence platform
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-8">
          Connect your GitHub account and chat with your codebase.
        </p>
      </div>
    </main>
  )
}
EOF
```

- [ ] **Step 4: Create frontend/src/lib/api.ts**

```bash
cat > src/lib/api.ts << 'EOF'
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchApi(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  return response
}

export async function getHealthStatus() {
  const response = await fetchApi("/api/v1/health")
  return response.json()
}
EOF
```

- [ ] **Step 5: Create public/.gitkeep**

```bash
touch public/.gitkeep
```

- [ ] **Step 6: Commit frontend app structure**

```bash
git add frontend/src/ frontend/public/
git commit -m "feat: create Next.js app with layout and home page"
```

---

### Task 10: Install Dependencies and Test Both Projects

**Files:**
- No new files created, installation only

**Interfaces:**
- Consumes: pyproject.toml, package.json, Node.js/Python environments
- Produces: Installed dependencies for both backend and frontend

- [ ] **Step 1: Install backend dependencies**

```bash
cd /home/devkrsna/Projects/sourcelens/backend
pip install -e ".[dev]"
```

Expected: All Python dependencies installed successfully.

- [ ] **Step 2: Verify backend installation**

```bash
python -c "import fastapi; import sqlalchemy; print('Backend dependencies OK')"
```

Expected: "Backend dependencies OK" printed to console.

- [ ] **Step 3: Install frontend dependencies**

```bash
cd /home/devkrsna/Projects/sourcelens/frontend
npm install
```

Expected: All Node.js dependencies installed successfully.

- [ ] **Step 4: Verify frontend installation**

```bash
npm list next react tailwindcss
```

Expected: All key packages listed with correct versions.

- [ ] **Step 5: Test backend health endpoint**

```bash
cd /home/devkrsna/Projects/sourcelens/backend
python -m pytest tests/test_health.py -v
```

Expected: PASSED for test_health_check.

- [ ] **Step 6: Commit installation verification**

```bash
cd /home/devkrsna/Projects/sourcelens
git add .
git commit -m "chore: verify dependencies installed successfully"
```

---

### Task 11: Create Initial Database Migration

**Files:**
- Create: `backend/alembic/versions/001_init.py`

**Interfaces:**
- Consumes: Alembic, SQLAlchemy models
- Produces: Database migration for User table

- [ ] **Step 1: Create migration file**

```bash
cd /home/devkrsna/Projects/sourcelens/backend
cat > alembic/versions/001_init.py << 'EOF'
"""Initial migration: create users table."""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('access_token', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('github_id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email'),
    )

def downgrade() -> None:
    op.drop_table('users')
EOF
```

- [ ] **Step 2: Commit migration**

```bash
cd /home/devkrsna/Projects/sourcelens
git add backend/alembic/versions/
git commit -m "chore: add initial database migration for users table"
```

---

## Spec Coverage Checklist

- ✅ Backend FastAPI project structure (Task 2)
- ✅ Database setup (Task 3, 11)
- ✅ ORM models and Pydantic schemas (Task 4, 5)
- ✅ API endpoints (Task 6, 7)
- ✅ Frontend Next.js project (Task 8, 9)
- ✅ TypeScript configuration (Task 8)
- ✅ Tailwind CSS setup (Task 8)
- ✅ AI SDK ready for integration (Task 8)
- ✅ Environment configuration (Task 1, 2, 8)
- ✅ Docker Compose for local dev (Task 1)
- ✅ Git repository initialized (Task 1)
- ✅ Dependencies configured (Task 2, 10)
- ✅ Testing setup (Task 10)

---

## Next Steps

After completing all tasks:

1. Start Docker services: `docker-compose up -d`
2. Run migrations: `cd backend && alembic upgrade head`
3. Start backend: `cd backend && uvicorn app.main:app --reload`
4. Start frontend: `cd frontend && npm run dev`
5. Access frontend at `http://localhost:3000`
6. API docs at `http://localhost:8000/docs`

---

Plan complete and saved to `docs/superpowers/plans/2026-07-12-project-setup.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
