import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK_TMDB_PORT = 4010;

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
      command: `pnpm build && pnpm start --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      timeout: 180_000,
      env: {
        TMDB_API_KEY: "e2e-test-key",
        TMDB_API_BASE_URL: `http://localhost:${MOCK_TMDB_PORT}/3`,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
