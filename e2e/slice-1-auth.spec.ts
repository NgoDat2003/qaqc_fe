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
    test("Sai password → error message rõ ràng", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', TEST_USERS.qam.email)
      await page.fill('[name="password"]', "wrongpassword")
      await page.click('[type="submit"]')
      await expect(page.getByRole("alert")).toBeVisible()
      await expect(page).toHaveURL("/login") // không redirect
    })

    test("Email không tồn tại → error", async ({ page }) => {
      await page.goto("/login")
      await page.fill('[name="email"]', "notexist@test.com")
      await page.fill('[name="password"]', "anything")
      await page.click('[type="submit"]')
      await expect(page.getByRole("alert")).toBeVisible()
    })

    test("Submit form rỗng → validation error tại field", async ({ page }) => {
      await page.goto("/login")
      await page.click('[type="submit"]')
      // Lỗi phải hiện tại field, không phải chỉ toast
      await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true")
    })

    test("Truy cập dashboard khi chưa login → redirect /login", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page).toHaveURL(/\/login/)
    })

    test("Cookie hết hạn → redirect /login khi gọi API", async ({ page }) => {
      await loginAs(page, "qam")
      // Xóa cookie giả lập hết hạn
      await page.context().clearCookies()
      await page.reload()
      await expect(page).toHaveURL(/\/login/)
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
