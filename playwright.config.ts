import { defineConfig, devices } from "@playwright/test"

const portfolioCapture = process.env.E2E_PORTFOLIO_CAPTURE === "true"
const slowMo = Number(process.env.E2E_SLOW_MO ?? 0) || 0
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3001"
const shouldStartLocalServer = !process.env.E2E_BASE_URL

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  reporter: "html",
  use: {
    baseURL,
    trace: portfolioCapture ? "on" : "on-first-retry",
    screenshot: portfolioCapture ? "on" : "only-on-failure",
    video: portfolioCapture ? "on" : "retain-on-failure",
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Mobile: run manually with --project=mobile when testing mobile UX specifically
    // { name: "mobile", use: { ...devices["iPhone 14"] } },
  ],
  webServer: shouldStartLocalServer
    ? {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 30000,
      }
    : undefined,
})
