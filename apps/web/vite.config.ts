import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // The Go API's local server (`pnpm --filter api dev`). In production CloudFront routes /graphql.
    proxy: { "/graphql": process.env.API_URL ?? "http://localhost:8787" },
  },
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  plugins: [tailwindcss(), tanstackStart(), nitro(), react()],
  // Production runs in Lambda (infra/app); `build:node` and the e2e suite use node-server.
  nitro: { preset: process.env.NITRO_PRESET ?? "aws-lambda" },
});
