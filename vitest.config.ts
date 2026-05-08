import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // vitest 4.x: disable module isolation để setupFiles lifecycle hooks
    // (afterEach/beforeAll/afterAll) hoạt động đúng với collectorContext
    isolate: false,
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/features/**", "src/lib/**", "src/components/**", "src/shared/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
