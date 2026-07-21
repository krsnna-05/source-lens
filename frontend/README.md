# SourceLens Frontend

Minimal Next.js frontend for SourceLens.

## Run locally

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Typography

Font usage in the frontend:

- UI: `Geist`
- Repository names: `Geist Mono`
- File paths: `Geist Mono`
- Search results: `Geist Mono`
- Code viewer: `Geist Mono`
- Terminal output: `Geist Mono`

Available utility classes:

- `.font-ui`
- `.font-repository`
- `.font-file-path`
- `.font-search-result`
- `.font-code-viewer`
- `.font-terminal-output`

## Notes

- Frontend root route: `/`
- Backend health endpoint (default dev): `http://localhost:8000/api/health/`
