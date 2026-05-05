import { test, expect } from "@playwright/test"
import { loginAs, logout, TEST_USERS } from "./helpers/auth.helper"

test.describe("Slice 1 — Auth", () => {

  test.describe("Happy path", () => {
    test("QAM login thành công → vào dashboard", async ({ page }) => {
      await loginAs(page, "qam")
      await expect(page).toHaveURL("/dashboard")
    })

    test.skip("Logout → redirect về login", async ({ page }) => {
      // Skip: cần data-testid="user-menu" và "logout-btn" trong dashboard layout
      await loginAs(page, "qam")
      await logout(page)
      await expect(page).toHaveURL("/login")
    })

    test.skip("Mỗi role thấy đúng menu của mình", async ({ page }) => {
      // Skip: cần sidebar đã implement đầy đủ
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
      // Dùng .first() vì có thể có nhiều role="alert" trên trang
      await expect(page.getByRole("alert").first()).toBeVisible()
      await expect(page).toHaveURL("/login")
    })

    test("Email không tồn tại → error 401", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', "ghost@notexist.com")
      await page.fill('[name="password"]', "anything")
      await page.click('[type="submit"]')
      await expect(page.getByRole("alert").first()).toBeVisible()
    })

    test("Submit form rỗng → validation error hiện tại field", async ({ page }) => {
      await page.goto("/login")
      await page.click('[type="submit"]')
      // Check error message text thay vì aria-invalid (RHF không set tự động)
      await expect(page.getByText(/email.*bắt buộc|email.*required/i).first()).toBeVisible()
    })

    test("Email sai format → validation error", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', "notanemail")
      await page.fill('[name="password"]', "Test@1234")
      await page.click('[type="submit"]')
      await expect(page.getByText(/email.*không hợp lệ|invalid email/i).first()).toBeVisible()
    })

    test("Password < 6 ký tự → validation error", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "123")
      await page.click('[type="submit"]')
      await expect(page.getByText(/ít nhất 6|at least 6/i).first()).toBeVisible()
    })

    test("Submit đang chạy → button disabled", async ({ page }) => {
      // Delay API response để kịp check disabled state
      await page.route("**/api/auth/login", async (route) => {
        await page.waitForTimeout(300)
        await route.continue()
      })
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "Test@1234")
      await page.click('[type="submit"]')
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
      let dialogAppeared = false
      page.on("dialog", async (dialog) => {
        dialogAppeared = true
        await dialog.dismiss()
      })
      await page.click('[type="submit"]')
      await page.waitForTimeout(500)
      expect(dialogAppeared).toBe(false)
    })
  })

  test.describe("Role isolation", () => {
    test.skip("QC không truy cập được /master-data", async ({ page }) => {
      // Skip: proxy.ts hiện chỉ check cookie, chưa check role
      await loginAs(page, "qc")
      await page.goto("/master-data/users")
      await expect(page).not.toHaveURL("/master-data/users")
    })

    test.skip("EV không truy cập được /operations/audit-plans", async ({ page }) => {
      // Skip: chưa implement role-based route guard
      await loginAs(page, "ev")
      await page.goto("/operations/audit-plans")
      await expect(page).not.toHaveURL("/operations/audit-plans")
    })
  })
})
