import { test, expect } from "@playwright/test"
import { loginAs, logout, TEST_USERS } from "./helpers/auth.helper"

test.describe("Slice 1 — Auth", () => {

  test.describe("Happy path", () => {
    test("QAM login thành công → vào dashboard", async ({ page }) => {
      await loginAs(page, "qam")
      await expect(page).toHaveURL("/dashboard")
    })

    test("Logout → redirect về login", async ({ page }) => {
      await loginAs(page, "qam")
      await logout(page)
      await expect(page).toHaveURL("/login")
    })

    test("Mỗi role thấy đúng menu của mình", async ({ page }) => {
      // QC chỉ thấy My Audits
      await loginAs(page, "qc")
      await expect(page.getByText("My Audits")).toBeVisible()
      await expect(page.getByText("Audit Plans")).not.toBeVisible()
    })
  })

  test.describe("Boundary cases", () => {
    test("Sai password → error hiện trong form, không redirect", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "wrongpassword")
      await page.click('[type="submit"]')
      await expect(page.getByRole("alert")).toBeVisible()
      await expect(page).toHaveURL("/login")
    })

    test("Email không tồn tại → error 401", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', "ghost@notexist.com")
      await page.fill('[name="password"]', "anything")
      await page.click('[type="submit"]')
      await expect(page.getByRole("alert")).toBeVisible()
    })

    test("Submit form rỗng → validation errors tại field (không phải chỉ toast)", async ({ page }) => {
      await page.goto("/login")
      await page.click('[type="submit"]')
      await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true")
    })

    test("Email sai format → validation error", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', "notanemail")
      await page.fill('[name="password"]', "Test@1234")
      await page.click('[type="submit"]')
      await expect(page.getByText(/email.*không hợp lệ|invalid email/i)).toBeVisible()
    })

    test("Password < 6 ký tự → validation error", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "123")
      await page.click('[type="submit"]')
      await expect(page.getByText(/ít nhất 6|at least 6/i)).toBeVisible()
    })

    test("Submit đang chạy → button disabled, không double-submit", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "Test@1234")
      // Click 2 lần nhanh
      await page.click('[type="submit"]')
      await page.click('[type="submit"]')
      // Chỉ có 1 request (không double-submit)
      // Verify bằng cách check button disabled sau click đầu
      await expect(page.locator('[type="submit"]')).toBeDisabled()
    })

    test("Truy cập dashboard khi chưa login → redirect /login", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page).toHaveURL(/\/login/)
    })

    test("Cookie hết hạn → redirect /login", async ({ page }) => {
      await loginAs(page, "qam")
      await page.context().clearCookies()
      await page.reload()
      await expect(page).toHaveURL(/\/login/)
    })

    test("XSS trong email field → không execute script", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', '<script>alert("xss")</script>')
      await page.fill('[name="password"]', "Test@1234")
      await page.click('[type="submit"]')
      // Nếu XSS thành công sẽ có dialog → test fail
      let dialogAppeared = false
      page.on("dialog", () => { dialogAppeared = true })
      await page.waitForTimeout(500)
      expect(dialogAppeared).toBe(false)
    })
  })

  test.describe("Role isolation", () => {
    test("QC không truy cập được /master-data", async ({ page }) => {
      await loginAs(page, "qc")
      await page.goto("/master-data/users")
      // Phải redirect hoặc hiện forbidden
      await expect(page).not.toHaveURL("/master-data/users")
    })

    test("EV không truy cập được /operations/audit-plans", async ({ page }) => {
      await loginAs(page, "ev")
      await page.goto("/operations/audit-plans")
      await expect(page).not.toHaveURL("/operations/audit-plans")
    })
  })
})
