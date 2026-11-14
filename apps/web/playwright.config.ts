import { defineConfig, devices } from "@playwright/test";

// Runs production builds locally: a mock TMDB, the Go API's local server (same handler as the
// Lambda) and the TanStack Start node build, which calls the API cross-origin.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const API_PORT = Number(process.env.E2E_API_PORT ?? 8788);
const MOCK_TMDB_PORT = Number(process.env.E2E_MOCK_TMDB_PORT ?? 4010);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/e2e/mock-tmdb.mjs",
      url: `http://localhost:${MOCK_TMDB_PORT}/health`,
      env: { MOCK_TMDB_PORT: String(MOCK_TMDB_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "go run ./cmd/local",
      cwd: "../api",
      url: `http://localhost:${API_PORT}/graphql?query=%7B__typename%7D`,
      timeout: 120_000,
      env: {
        ADDR: `:${API_PORT}`,
        ALLOWED_ORIGIN: `http://localhost:${PORT}`,
        TMDB_API_KEY: "e2e-test-key",
        TMDB_API_BASE_URL: `http://localhost:${MOCK_TMDB_PORT}/3`,
      },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm build:node && pnpm start",
      url: `http://localhost:${PORT}`,
      timeout: 180_000,
      env: {
        PORT: String(PORT),
        VITE_GRAPHQL_URL: `http://localhost:${API_PORT}/graphql`,
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
