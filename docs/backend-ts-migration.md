# Backend TS Migration Reference

Snapshot of everything the old Python/FastAPI backend already implemented (last committed at `3da2a11`, deleted in `8e7d0d4`), plus the exact contract the Next.js frontend expects, so the Express+TS rewrite can match it precisely.

Scope: **auth + repository CRUD only**. Background jobs / queue / cloning / indexing are intentionally excluded — being learned/implemented separately.

---

## 1. Frontend contract (source of truth — do not deviate)

Base URL: `NEXT_PUBLIC_API_URL` (frontend `.env`), defaults to `http://localhost:8000`. All paths are prefixed `/api/...` (no `/api/v1`).

No shared fetch wrapper exists on the frontend — each component calls `fetch` directly against `API_BASE_URL` from `lib/config.ts`.

### Auth endpoints

| Call site | Method + path | Auth | Body | Response |
|---|---|---|---|---|
| `components/Navbar.tsx:26` | `GET /api/auth/github/login` | — (browser redirect via `window.location.href`) | — | 307 redirect to GitHub |
| `app/auth/callback/page.tsx:58` | `POST /api/auth/github/callback` | `credentials: "include"` | `{ code, state }` | `{ access_token, token_type, user: { id, github_id, username, email, avatar_url } }` |
| `components/AuthProvider.tsx:28` | `POST /api/auth/refresh` | `credentials: "include"`, no body | — | `{ access_token, user: { username, avatar_url, ... } }` |
| `components/Navbar.tsx:32` | `POST /api/auth/logout` | `credentials: "include"`, fire-and-forget | — | (ignored) |

Notes:
- Access token lives **in memory only** (Zustand store `lib/store.ts`), never localStorage — lost on reload except for the silent `/api/auth/refresh` call `AuthProvider` fires once on mount, which re-hydrates it from the httponly `refresh_token` cookie.
- Auth endpoints rely purely on cookies (`credentials: "include"`); no `Authorization` header on them.
- No 401-retry/interceptor logic on the frontend — a failed Bearer request just surfaces a generic error.

### Repository endpoints

| Call site | Method + path | Auth | Query/Body | Response |
|---|---|---|---|---|
| `AddRepoDialog.tsx:65` | `GET /api/repos/github?page=&per_page=5` | `Authorization: Bearer <token>` | — | `{ repos: GitHubRepo[], has_more, next_page }` |
| `AddRepoDialog.tsx:119` | `GET /api/repos/github/lookup?owner=&name=` | `Authorization: Bearer` | — | single `GitHubRepo`, 404 if not found |
| `app/dashboard/page.tsx:62` | `GET /api/repos` | `Authorization: Bearer` | — | `Repository[]` |
| `app/dashboard/page.tsx:95` | `POST /api/repos` | `Authorization: Bearer` + `Content-Type: application/json` | `{ name, owner, url, default_branch, provider: "github" }` | `Repository` (201) |
| `app/dashboard/page.tsx:128` | `DELETE /api/repos/{id}` | `Authorization: Bearer` | — | 204, no body |

```ts
type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  html_url: string;
};

type Repository = {
  id: string; // uuid
  name: string;
  owner: string;
  url: string;
  provider: "github" | "gitlab" | "local";
  default_branch: string;
  status: "pending" | "indexing" | "ready" | "failed";
  index_mode: "manual" | "auto";
  last_indexed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 2. What the Python backend already implemented

### Auth (`app/api/v1/auth.py`, `app/auth/{oauth,jwt,dependencies}.py`)

- `GET /auth/github/login` — generates CSRF `state` (`secrets.token_urlsafe(24)`), sets it as httponly cookie `oauth_state` (10 min max-age), 307-redirects to GitHub authorize URL (`scope=read:user user:email repo`, `allow_signup=true`).
- `POST /auth/github/callback` — body `{ code, state }`. Verifies `state` against the `oauth_state` cookie (deletes cookie either way), exchanges `code` for a GitHub access token, fetches profile (`GET /user`, falling back to `/user/emails` if primary email is private — picks primary+verified, else any verified), upserts the `User` row (match on `github_id`; updates username/email/avatar/access_token on existing users), sets httponly `refresh_token` cookie (path `/api/auth`, `max_age = JWT_REFRESH_EXPIRATION_DAYS * 86400`, `secure` in production, `samesite=lax`), returns `{ access_token, token_type: "bearer", user }`.
- `POST /auth/logout` — clears `refresh_token` cookie (path `/api/auth`), 204.
- `POST /auth/refresh` — reads `refresh_token` cookie, decodes it, verifies `type === "refresh"`, loads the user, rotates the refresh cookie, returns a fresh `{ access_token, token_type, user }`. 401 (and clears cookie) if missing/invalid/expired/wrong-type/user-deleted.

JWT (`app/auth/jwt.py`): HS256, payload `{ sub: userId (string), type: "access"|"refresh", iat, exp }`. Access token expires in `JWT_EXPIRATION_HOURS` (24), refresh in `JWT_REFRESH_EXPIRATION_DAYS` (7). Secret from `JWT_SECRET_KEY` env var.

Auth dependency (`get_current_user`): reads `Authorization: Bearer <token>`, decodes, requires `type === "access"`, loads user by `sub`, 401 on any failure (missing header, invalid/expired token, wrong type, user not found).

### Repository management (`app/api/v1/repos.py`, `app/repository/github.py`, `app/services/repository_service.py`)

- `GET /repos/github?page=&per_page=` — lists the authenticated user's GitHub repos via `GET https://api.github.com/user/repos` (`sort=updated`, `affiliation=owner,collaborator,organization_member`), `has_more` derived from GitHub's `Link` response header (`"next" in response.links`). 502 if GitHub unreachable/rejects.
- `GET /repos/github/lookup?owner=&name=` — `GET https://api.github.com/repos/{owner}/{name}`, 404 if GitHub returns 404, 502 on other failures.
- `POST /repos` — body `{ name, owner, url, default_branch="main", provider="github" }`. `get_or_create_repository`: looks up existing row by `(user_id, owner, name)` unique constraint, returns it if found, else creates with `status=PENDING`. 201.
- `GET /repos` — lists the user's repositories, newest (`created_at desc`) first.
- `DELETE /repos/{id}` — deletes if it belongs to the user, 404 otherwise.

All repo routes require `get_current_user` (Bearer token), and every query/mutation is scoped by `user_id`.

### Data models

`User` (`app/models/user.py`): `id` (int PK), `github_id` (unique), `username` (unique), `email` (unique), `avatar_url` (nullable), `access_token` (GitHub token, **stored in plaintext** — known gap, not fixed here), `created_at`/`updated_at`.

`Repository` (`app/models/repository.py`): `id` (uuid PK), `user_id` (FK, cascade delete), `name`, `owner`, `url`, `provider` (enum: github/gitlab/local, default github), `default_branch` (default "main"), `local_path` (nullable, unused so far), `latest_remote_commit`/`last_indexed_commit` (nullable, unused so far), `status` (enum: pending/indexing/ready/failed, default pending), `index_mode` (enum: manual/auto, default manual), `last_indexed_at` (nullable), `last_error` (nullable), `created_at`/`updated_at`. Unique constraint on `(user_id, owner, name)`. Computed `is_synced = last_indexed_commit == latest_remote_commit` (not persisted).

Config (`app/core/config.py`) also predefined (unused) settings for embeddings/LLM/retrieval/indexing — out of scope here, but worth mirroring as placeholder env vars for parity when that work starts.

---

## 3. Express + TS rewrite plan

Stack: **Express + Prisma + Zod** (per user's stated experience).

### Step order (confirm before each)

1. ~~Scaffold~~ — done: `package.json`, `tsconfig.json`, `src/config/config.ts`, `src/index.ts` (Express app, `/` + `/health`), `tsx` as the dev runner (TypeScript 7 broke `ts-node`).
2. **Prisma schema** — `User` and `Repository` models mirroring the SQLAlchemy models above (same fields, same enums, same unique constraint), migrate to Postgres.
3. **Config module** — extend `src/config/config.ts` with the env vars actually needed for auth+repos: `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRATION_HOURS`, `JWT_REFRESH_EXPIRATION_DAYS`, `CORS_ORIGINS`.
4. **JWT helpers** — `createAccessToken`, `createRefreshToken`, `decodeToken`, matching the payload shape (`sub`, `type`, `iat`, `exp`) and expirations above.
5. **GitHub OAuth helpers** — authorize URL builder, code-exchange, profile fetch (+ email fallback logic), matching scopes exactly.
6. **Auth middleware** — Express equivalent of `get_current_user`: parses `Authorization: Bearer`, verifies `type === "access"`, attaches `req.user`, 401 on failure.
7. **Auth routes** — `/api/auth/github/login`, `/api/auth/github/callback`, `/api/auth/logout`, `/api/auth/refresh`, with identical cookie names/paths/flags (`oauth_state`, `refresh_token` scoped to `/api/auth`) and identical response shapes.
8. **Repository service + routes** — `/api/repos/github`, `/api/repos/github/lookup`, `POST /api/repos`, `GET /api/repos`, `DELETE /api/repos/:id`, identical to the table above, Zod-validated bodies/queries.
9. **CORS + cookie-parser wiring** — `credentials: true`, origin matching frontend's `http://localhost:3000`, since the frontend uses `credentials: "include"`.
10. **Manual verification against the frontend** — run both apps, exercise login → callback → dashboard → add repo → refresh → logout, confirm response shapes match exactly (frontend does zero validation/transform, so field names must match verbatim).

Explicitly out of scope: `core/queue.py`, `app/jobs/*`, `services/backend_storage.py` (clone/delete/enqueue) — left for the user to design and build themselves.
