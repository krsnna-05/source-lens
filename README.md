# 🚀 SourceLens

> **AI-powered repository intelligence. Chat with any GitHub repository.**

SourceLens is an AI-powered platform that helps developers understand unfamiliar codebases by combining semantic search, Retrieval-Augmented Generation (RAG), and intelligent code indexing.

Instead of manually browsing hundreds of files, simply import a GitHub repository and ask questions in natural language.

Examples:

* How does authentication work?
* Where is JWT verification implemented?
* Explain the request flow.
* Which service creates a booking?
* Where is the database connection initialized?

SourceLens retrieves the most relevant code and documentation before generating accurate, source-backed answers.

---

# ✨ Features

## 🔐 Authentication

* GitHub OAuth
* JWT Authentication
* Multi-tenant architecture
* Secure API authorization

## 📦 Repository Management

* Import repositories from GitHub
* Support public and private repositories
* Background repository indexing
* Incremental re-indexing
* Repository status tracking

## 🧠 AI Repository Chat

* Repository-aware conversations
* Retrieval-Augmented Generation (RAG)
* Semantic code search
* Streaming AI responses
* Source citations
* Conversation history

## 🔍 Intelligent Code Indexing

* Git repository cloning
* Recursive file scanning
* Tree-sitter parsing
* Semantic code chunking
* Embedding generation
* Vector indexing

---

# 🏗 Architecture

```text
                   Next.js
             (AI SDK + React)
                     │
                     ▼
                  FastAPI
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Authentication  Repository      Chat API
                 Management
                     │
                     ▼
            Background Workers
                     │
                     ▼
               Git Clone Service
                     │
                     ▼
             Repository Scanner
                     │
                     ▼
              Tree-sitter Parser
                     │
                     ▼
               Semantic Chunking
                     │
                     ▼
            Embedding Generation
                     │
                     ▼
         PostgreSQL + pgvector
                     │
                     ▼
            Retrieval Pipeline
                     │
                     ▼
              Ollama / LLM
                     │
                     ▼
      Streaming Responses + Citations
```

---

# ⚙️ Indexing Pipeline

When a repository is imported:

1. Clone the repository.
2. Scan supported source files.
3. Parse code using Tree-sitter.
4. Extract semantic units (functions, classes, methods, etc.).
5. Generate embeddings.
6. Store vectors and metadata in PostgreSQL using pgvector.
7. Mark the repository as ready for AI chat.

Once indexing is complete, every question follows the RAG pipeline:

Question → Semantic Search → Relevant Code → LLM → Answer + Source Citations

---

# 📁 Supported Languages

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

# 🛠 Tech Stack

### Frontend

* Next.js
* AI SDK
* React
* Tailwind CSS
* shadcn/ui

### Backend

* FastAPI
* PostgreSQL
* pgvector
* SQLAlchemy
* Tree-sitter
* GitPython
* Sentence Transformers
* Ollama

---

# 🗺 Roadmap

* [ ] GitHub OAuth
* [ ] Multi-tenant architecture
* [ ] Repository dashboard
* [ ] Background indexing jobs
* [ ] Tree-sitter parsing
* [ ] Semantic search
* [ ] Hybrid retrieval (Vector + Keyword)
* [ ] Re-ranking
* [ ] Tool calling (`read_file`, `grep`, `find_symbol`, `list_directory`)
* [ ] Incremental repository updates
* [ ] Multi-model support
* [ ] GitHub App integration

---

# 🎯 Vision

SourceLens aims to become an AI-powered code intelligence platform that helps developers explore, understand, and navigate software projects efficiently.

The long-term goal is to combine semantic retrieval, code-aware indexing, intelligent tooling, and modern language models into a seamless developer experience.

---

# 📄 License

MIT License
