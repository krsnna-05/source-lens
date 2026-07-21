# SourceLens Backend

AI-powered repository intelligence platform backend powered by FastAPI, PostgreSQL, and vector embeddings.

## Architecture

The backend is organized into independent, loosely-coupled modules:

```
app/
├── api/          # REST API endpoints (v1 versioning)
├── auth/         # GitHub OAuth & JWT authentication
├── chat/         # Chat and conversational endpoints
├── database/     # Database connections and transactions
├── models/       # SQLAlchemy ORM models
├── schemas/      # Pydantic request/response schemas
├── services/     # Business logic layer
├── utils/        # Utility functions and helpers
└── core/         # Core configuration and constants
```

## Development Setup

### Prerequisites

- Python 3.11+
- uv
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sourcelens/backend
   ```

2. **Create a virtual environment (uv):**
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies (uv):**
   ```bash
   uv sync --extra dev
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create PostgreSQL database:**
   ```bash
   createdb sourcelens_db
   ```

6. **Run Alembic migrations:**
   ```bash
   uv run alembic upgrade head
   ```

### Running the Application

Start the development server:

```bash
uv run uvicorn app.main:app_instance --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

### Create a new migration

After modifying models, create an automatic migration:

```bash
uv run alembic revision --autogenerate -m "Description of changes"
```

Then review and apply:

```bash
uv run alembic upgrade head
```

### Downgrade migrations

```bash
uv run alembic downgrade -1
```



## Code Quality

### Format code with Black:

```bash
uv run black app/
```

### Lint with Ruff:

```bash
uv run ruff check app/
```

### Type checking with mypy:

```bash
uv run mypy app/
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials
- `JWT_SECRET_KEY`: Secret key for JWT signing
- `OLLAMA_BASE_URL`: LLM service URL
- `EMBEDDING_MODEL`: Model name for embeddings

## API Endpoints

### Authentication
- `POST /api/auth/github/authorize` - GitHub OAuth login
- `POST /api/auth/github/callback` - OAuth callback handler
- `POST /api/auth/refresh` - Refresh JWT token

### Repositories
- `GET /api/repositories` - List user repositories
- `POST /api/repositories` - Import new repository
- `GET /api/repositories/{repo_id}` - Get repository details
- `DELETE /api/repositories/{repo_id}` - Remove repository

### Chat
- `POST /api/chat` - Send message and get response
- `GET /api/chat/history/{repo_id}` - Get chat history

## Logging

All logs are configured via environment variables. Default level is `INFO`.

Logs include:
- API requests and responses
- Repository operations
- Indexing jobs
- Retrieval operations
- Error traces

## Performance Considerations

- Indexing runs asynchronously as background jobs
- Vector search uses pgvector for efficient similarity queries
- Database connection pooling with configurable pool size
- Batch processing for embeddings
- Request/response caching where appropriate

## Contributing

When contributing code:
1. Follow existing code style (Black formatted, Ruff compliant)
2. Add type hints to all functions
3. Keep functions focused and testable
4. Prefer small, composable modules
5. Prefer composition over inheritance
6. Avoid deeply nested conditionals

## Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql postgresql://user:password@localhost:5432/sourcelens_db
```

### Migration Errors
```bash
# View migration history
uv run alembic history

# Reset to specific migration
uv run alembic downgrade <revision>
```

### Port Already in Use
```bash
# Run on different port
uv run uvicorn app.main:app_instance --port 8001
```

## License

MIT
