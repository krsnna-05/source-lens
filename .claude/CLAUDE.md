# SourceLens — Claude Project Context

## Project Overview

SourceLens is an AI-powered repository intelligence platform that allows users to connect their GitHub account, import repositories, index source code, and chat with their codebase using Retrieval-Augmented Generation (RAG).

The objective is to build a clean, modular, production-quality backend while learning modern AI engineering concepts.

---

# Core Principles

* Prioritize clean architecture over quick hacks.
* Prefer readability over cleverness.
* Keep modules loosely coupled.
* Design for future scalability.
* Avoid unnecessary abstractions.
* Every feature should have a clear responsibility.

---

# Tech Stack

## Frontend

* Next.js
* React
* AI SDK
* TailwindCSS
* shadcn/ui

## Backend

* FastAPI
* PostgreSQL
* pgvector
* SQLAlchemy
* Alembic
* Tree-sitter
* Sentence Transformers
* Ollama
* GitPython

---

# Architecture

The backend should be organized into independent services.

```text
app/

├── api/
├── auth/
├── chat/
├── repository/
├── indexing/
├── retrieval/
├── llm/
├── embeddings/
├── workers/
├── database/
├── models/
├── schemas/
├── services/
├── utils/
└── core/
```

Each module should own its models, services, and business logic where appropriate.

---

# Coding Guidelines

* Use Python type hints everywhere.
* Use Pydantic models for request/response validation.
* Keep API routes thin.
* Business logic belongs in services.
* Database access belongs in repositories or service layer.
* Avoid duplicate logic.
* Follow SOLID principles where practical.
* Prefer dependency injection for services.
* Use async code where it provides real benefit.

---

# API Guidelines

* Follow REST conventions.
* Return consistent JSON responses.
* Validate all inputs.
* Raise HTTP exceptions with meaningful messages.
* Never expose internal exceptions to clients.

---

# Database

Primary database:

* PostgreSQL

Vector storage:

* pgvector

Do not introduce another database unless there is a strong architectural reason.

---

# Authentication

* GitHub OAuth
* JWT Authentication
* Refresh Tokens
* Multi-tenant authorization

Every protected resource must be scoped to the authenticated user.

---

# Repository Indexing Pipeline

1. Clone repository.
2. Scan supported files.
3. Ignore generated directories.
4. Parse code using Tree-sitter.
5. Build semantic chunks.
6. Generate embeddings.
7. Store metadata and vectors.
8. Mark repository as ready.

Indexing must execute as a background job.

---

# Retrieval Pipeline

Question

↓

Embedding

↓

Vector Search

↓

Keyword Search

↓

Merge Results

↓

Re-rank

↓

Build Context

↓

LLM

↓

Streaming Response

↓

Source Citations

---

# Supported Languages

* Python
* TypeScript
* JavaScript
* Go
* Rust
* Java
* Markdown
* JSON
* YAML
* TOML

---

# Source Citations

Every AI response should include references whenever possible.

Example:

* File path
* Symbol name
* Line numbers

Responses should always be grounded in retrieved repository context.

---

# Logging

Log:

* API requests
* Repository imports
* Indexing jobs
* Retrieval operations
* LLM requests
* Tool executions
* Errors

Never log secrets or tokens.

---

# Error Handling

Handle gracefully:

* Invalid GitHub URLs
* Repository clone failures
* Empty repositories
* Unsupported repositories
* Embedding failures
* LLM failures
* Database failures

Return actionable error messages.

---

# Performance Goals

* Keep API responses fast.
* Never block request threads during indexing.
* Batch embedding generation.
* Re-index only modified files when possible.
* Minimize database round trips.

---

# Code Style

* Small functions.
* Descriptive names.
* Minimal comments unless explaining intent.
* Avoid deeply nested conditionals.
* Prefer composition over inheritance.

---

# Future Features

Planned additions include:

* Tool calling
* read_file
* grep
* list_directory
* find_symbol
* Hybrid retrieval
* Repository updates
* Multi-model support
* GitHub App integration
* Code editing
* Pull request analysis

Current implementations should remain extensible to support these features without major refactoring.

---

# Instructions for Claude

When generating code:

* Preserve the existing project architecture.
* Do not introduce unnecessary dependencies.
* Prefer production-quality implementations.
* Keep functions focused and testable.
* Explain architectural trade-offs when introducing new patterns.
* If a requested change conflicts with the current architecture, propose the cleaner alternative before implementing it.
