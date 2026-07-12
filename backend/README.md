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
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sourcelens/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -e ".[dev]"
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
   alembic upgrade head
   ```

### Running the Application

Start the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

### Create a new migration

After modifying models, create an automatic migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

Then review and apply:

```bash
alembic upgrade head
```

### Downgrade migrations

```bash
alembic downgrade -1
```

## Testing

Run the test suite:

```bash
pytest
```

With coverage:

```bash
pytest --cov=app tests/
```

Run specific tests:

```bash
pytest tests/test_auth.py -v
```

## Code Quality

### Format code with Black:

```bash
black app/ tests/
```

### Lint with Ruff:

```bash
ruff check app/ tests/
```

### Type checking with mypy:

```bash
mypy app/
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
- `POST /api/v1/auth/github/authorize` - GitHub OAuth login
- `POST /api/v1/auth/github/callback` - OAuth callback handler
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Repositories
- `GET /api/v1/repositories` - List user repositories
- `POST /api/v1/repositories` - Import new repository
- `GET /api/v1/repositories/{repo_id}` - Get repository details
- `DELETE /api/v1/repositories/{repo_id}` - Remove repository

### Chat
- `POST /api/v1/chat` - Send message and get response
- `GET /api/v1/chat/history/{repo_id}` - Get chat history

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
3. Write tests for new features
4. Keep functions focused and testable
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
alembic history

# Reset to specific migration
alembic downgrade <revision>
```

### Port Already in Use
```bash
# Run on different port
uvicorn app.main:app --port 8001
```

## License

MIT
