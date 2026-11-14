# Digishelf

A digital shelf for the movies and TV shows you love, so you can come back to them later.

Search [TMDB](https://www.themoviedb.org), put what you find on your shelf, and browse it as a wall of posters. The [MVP issue](https://github.com/Rohin-Chopra/digishelf/issues/4) tracks the first release, and the [`idea` issues](https://github.com/Rohin-Chopra/digishelf/issues?q=is%3Aissue+is%3Aopen+label%3Aidea) list what comes next.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [TMDB API](https://developer.themoviedb.org/docs) for movie and TV data
- pnpm workspaces and [Turborepo](https://turbo.build)
- ESLint, Prettier, husky, lint-staged and commitlint (Conventional Commits)

## Repository layout

```
apps/web   Next.js app
```

## Running locally

Requirements: Node 26 (see `.nvmrc`) and pnpm 10.

```bash
pnpm install
cp .env.example apps/web/.env.local   # then fill in TMDB_API_KEY
pnpm dev                               # http://localhost:3000
```

Get a free TMDB key at <https://www.themoviedb.org/settings/api>. `TMDB_API_KEY` takes either the v4 "API Read Access Token" or the v3 "API Key".

### Scripts

| Command          | What it does                    |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start the dev server            |
| `pnpm build`     | Production build                |
| `pnpm lint`      | ESLint                          |
| `pnpm typecheck` | TypeScript                      |
| `pnpm test`      | Unit tests                      |
| `pnpm format`    | Format everything with Prettier |

## Attribution

<img src="apps/web/public/tmdb-logo.svg" alt="TMDB" width="120" />

This product uses the TMDB API but is not endorsed or certified by TMDB.
