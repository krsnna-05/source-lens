# ============================================
# DEVELOPMENT STAGE - Fast, Hot Reload
# ============================================
FROM python:3.11-slim AS dev

WORKDIR /app

# Install only runtime system deps
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml and README (needed for setuptools)
COPY pyproject.toml README.md ./

# Copy app directory
COPY app app/

# Install Python deps
RUN pip install --no-cache-dir -e .

# Copy remaining files
COPY . .

EXPOSE 8000
ENV APP_ENV=dev

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ============================================
# BUILDER STAGE - Compile Dependencies
# ============================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml and README (needed for setuptools)
COPY pyproject.toml README.md ./

# Copy app directory
COPY app app/

# Build wheels
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -e .

# ============================================
# PRODUCTION STAGE - Minimal, Optimized
# ============================================
FROM python:3.11-slim AS prod

WORKDIR /app

# Install only runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels

# Install wheels (no build, fast)
RUN pip install --no-cache /wheels/* && rm -rf /wheels

# Copy app
COPY . .

# Install gunicorn
RUN pip install --no-cache-dir gunicorn

EXPOSE 8000
ENV APP_ENV=prod

CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-"]
