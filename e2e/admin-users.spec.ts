import { test, expect } from "@playwright/test";
import { loginAsAdmin, NAV_TIMEOUT, ELEMENT_TIMEOUT } from "./helpers/auth";

test.describe("Admin — Users page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator("[data-slot='sidebar-content']").getByText("Người dùng").first().click();
    await page.waitForURL("**/master-data/users", { timeout: NAV_TIMEOUT });
  });

  test("users page heading visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Quản lý người dùng/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("search filter input present", async ({ page }) => {
    await expect(page.locator("input[type='text'], input:not([type])").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("status filter area present", async ({ page }) => {
    // Verify the filter area renders (search input + select trigger both visible)
    await expect(page.locator("input[type='text'], input:not([type])").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    // Any element containing "trạng thái" text (Base UI Select renders differently)
    await expect(page.getByText(/trạng thái/i).first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Tạo người dùng opens UserDrawer", async ({ page }) => {
    const btn = page.locator("button").filter({ hasText: "Tạo người dùng" }).first();
    await expect(btn).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await btn.click();
    await expect(page.locator("[data-slot='sheet-content']")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Tạo người dùng mới")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("UserDrawer info tab has email and password fields", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Tạo người dùng" }).first().click();
    await page.locator("[data-slot='sheet-content']").waitFor({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/name@example.com/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/Tối thiểu 6 ký tự/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("UserDrawer roles tab accessible", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Tạo người dùng" }).first().click();
    await page.locator("[data-slot='sheet-content']").waitFor({ timeout: ELEMENT_TIMEOUT });
    await page.getByText("Phân quyền hệ thống").click();
    await expect(page.getByText("Cấu hình vai trò")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("metric cards visible", async ({ page }) => {
    await expect(page.getByText("Tổng người dùng")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });
});
