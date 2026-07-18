# ============================================
# BASE STAGE - Python + uv
# ============================================
FROM python:3.11-slim AS base

WORKDIR /app

# Install uv binary directly (no pip)
COPY --from=ghcr.io/astral-sh/uv:0.8.15 /uv /uvx /bin/

# Runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

ENV UV_LINK_MODE=copy

# ============================================
# DEVELOPMENT STAGE - Fast, Hot Reload
# ============================================
FROM base AS dev

# Copy dependency metadata first for better layer caching
COPY pyproject.toml uv.lock README.md ./
COPY app app/
COPY alembic alembic/

# Install app + dev dependencies with uv
RUN uv sync --frozen --extra dev

# Copy remaining files
COPY . .

EXPOSE 8000
ENV APP_ENV=dev

CMD ["uv", "run", "uvicorn", "app.main:app_instance", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ============================================
# BUILDER STAGE - Production dependency sync
# ============================================
FROM base AS builder

# Build tools (only needed during dependency builds)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY . .

# Install only runtime dependencies
RUN uv sync --frozen --no-dev

# ============================================
# PRODUCTION STAGE - Minimal runtime image
# ============================================
FROM base AS prod

COPY --from=builder /app /app

EXPOSE 8000
ENV APP_ENV=prod

CMD ["uv", "run", "gunicorn", "app.main:app_instance", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--access-logfile", "-"]
