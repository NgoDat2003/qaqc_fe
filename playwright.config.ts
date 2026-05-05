import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,            // ÉP CHỈ CHẠY 1 TIẾN TRÌNH (quan trọng để không treo máy)
  retries: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    headless: false,       // bật trình duyệt để bạn xem (giờ đã mượt rồi)
    launchOptions: {
      slowMo: 500,         // để 0.5s cho bạn xem kỹ
    },
    trace: "on",           // lưu lại trace để soi lỗi
    video: "on",           // LUÔN QUAY VIDEO để bạn xem lại sau khi test xong
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // { name: "mobile", use: { ...devices["iPhone 14"] } }, // Tạm tắt để nhẹ máy
  ],
  /* webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 30000,
  }, */
})
