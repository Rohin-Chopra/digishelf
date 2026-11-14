# Digishelf

A digital shelf for the movies and TV shows you love, so you can come back to them later.

Search [TMDB](https://www.themoviedb.org), put what you find on your shelf, and browse it as a wall of posters.

![My shelf](docs/screenshot.png) The [MVP issue](https://github.com/Rohin-Chopra/digishelf/issues/4) tracks the first release, and the [`idea` issues](https://github.com/Rohin-Chopra/digishelf/issues?q=is%3Aissue+is%3Aopen+label%3Aidea) list what comes next.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, TanStack Router and Query, Vite) with TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- A Go GraphQL API ([gqlgen](https://gqlgen.com)) that proxies the [TMDB API](https://developer.themoviedb.org/docs)
- AWS Lambda, API Gateway, CloudFront and S3, managed with [Pulumi](https://www.pulumi.com)
- pnpm workspaces and [Turborepo](https://turbo.build)
- ESLint, Prettier, husky, lint-staged and commitlint (Conventional Commits)

## How it works

- `/search` sends a GraphQL `search(query:)` to `/graphql`. The Go API calls TMDB's `/search/multi` and drops people, so `TMDB_API_KEY` stays in the API.
- `/` shows your shelf. For now it lives in `localStorage` (`digishelf:shelf:v1`), so no account is needed; accounts and a database come later.
- Posters load straight from TMDB's image CDN, with a `srcset` across TMDB's poster sizes.

## Repository layout

```
apps/web   TanStack Start app (SSR on Lambda)
apps/api   Go GraphQL API: schema in graph/schema.graphqls, Lambda in cmd/lambda, dev server in cmd/local
infra      Pulumi: the AWS stack (app) and the GitHub Actions deploy role (github)
```

## Running locally

Requirements: Node 26 (see `.nvmrc`), pnpm 10 and Go (see `apps/api/go.mod`).

```bash
pnpm install
TMDB_API_KEY=... pnpm --filter api dev   # GraphQL on http://localhost:8787/graphql
pnpm --filter web dev                    # http://localhost:3000, proxies /graphql to the API
```

Get a free TMDB key at <https://www.themoviedb.org/settings/api>. `TMDB_API_KEY` takes either the v4 "API Read Access Token" or the v3 "API Key".

After editing `apps/api/graph/schema.graphqls`, run `pnpm --filter api generate` to regenerate the gqlgen code.

### Scripts

| Command                      | What it does                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| `pnpm build`                 | Production builds: web for Lambda (`.output`) and the Go `bootstrap` |
| `pnpm lint`                  | ESLint, gofmt and go vet                                             |
| `pnpm typecheck`             | TypeScript and `go build`                                            |
| `pnpm test`                  | Unit tests (Vitest, Go and Pulumi mocks)                             |
| `pnpm --filter web test:e2e` | Playwright against a mock TMDB, the Go API and the web build         |
| `pnpm format`                | Format everything with Prettier                                      |

## Attribution

<img src="apps/web/public/tmdb-logo.svg" alt="TMDB" width="120" />

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Deployment

Pushes to `main` deploy to [digishelf.rohinchopra.com](https://digishelf.rohinchopra.com) via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): CI, then `pnpm build`, then `pulumi up` on the `production` stack of [`infra/app`](infra/app), then a smoke test of the site and `/graphql`.

- `infra/app`, in `ap-southeast-4`: CloudFront in front of S3 (`.output/public`), the TanStack Start SSR Lambda (Node 26) and the Go GraphQL Lambda (`provided.al2023`, arm64), plus ACM and Route 53. Each Lambda sits behind its own API Gateway HTTP API, because Lambda function URLs aren't available in `ap-southeast-4`. CloudFront sends `/graphql` to the API, so the browser calls it same-origin.
- `infra/github`: the OIDC role GitHub Actions assumes. Only jobs in the `production` environment can use it.
- Pulumi state is in S3 (`digishelf-pulumi-state-<account>`) and stack secrets are encrypted with the `alias/digishelf-pulumi` KMS key.

One-off setup, with admin AWS credentials and the Pulumi CLI:

```sh
pnpm install && pnpm build
TMDB_API_KEY=... infra/bootstrap.sh
```

Then, in GitHub, create a `production` environment and set the repository variable `AWS_ROLE_ARN` to the role the script prints.
