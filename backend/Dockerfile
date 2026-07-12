FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy application code
COPY . .

ARG PROFILE=dev
ENV PROFILE=${PROFILE}

EXPOSE 8000

# Development: hot reload
RUN if [ "$PROFILE" = "dev" ] ; then echo "Development mode" ; fi

# Production: optimized
RUN if [ "$PROFILE" = "prod" ] ; then pip install --no-cache-dir gunicorn ; fi

CMD if [ "$PROFILE" = "dev" ] ; then \
      uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload ; \
    else \
      gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 ; \
    fi
