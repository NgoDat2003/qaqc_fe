import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

process.env.TEST_API_BASE_URL ??= "http://localhost:3000/api"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/features/**", "src/lib/**", "src/components/**", "src/shared/**"],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
