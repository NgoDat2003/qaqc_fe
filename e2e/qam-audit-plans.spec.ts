import { test, expect } from "@playwright/test";
import { loginAsQAM, ELEMENT_TIMEOUT, NAV_TIMEOUT } from "./helpers/auth";

test.describe("QAM — Audit Plans", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    await page.goto("/qam/audit-plans");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("audit plans page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Kế hoạch Audit/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("status filter tabs visible", async ({ page }) => {
    await expect(page.getByText("Tất cả").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Đang mở").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Đã đóng").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Tạo kế hoạch navigates to create form", async ({ page }) => {
    await page.getByText(/Tạo kế hoạch/i).first().click();
    await page.waitForURL("**/qam/audit-plans/new", { timeout: NAV_TIMEOUT });
    await expect(page.getByRole("heading", { name: /Tạo kế hoạch Audit/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });
});

test.describe("QAM — Audit Plan Create Form", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    await page.goto("/qam/audit-plans/new");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("create form loads with required fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Tạo kế hoạch Audit/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    // Plan name input
    await expect(page.getByPlaceholder(/VD: Kiểm tra CHEP/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    // Checklist combobox
    await expect(page.getByText("Chọn checklist đã publish...").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("create form shows empty assignment state", async ({ page }) => {
    await expect(page.getByText("Chưa có cửa hàng nào")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText(/Nhấn \+ Thêm cửa hàng/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("+ Thêm cửa hàng opens store selection dialog", async ({ page }) => {
    await page.getByRole("button", { name: /Thêm cửa hàng/i }).first().click();
    await page.waitForTimeout(300);
    await expect(page.getByPlaceholder(/Tìm theo mã hoặc tên/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Hủy navigates away from create form", async ({ page }) => {
    await page.getByRole("button", { name: "Hủy" }).click();
    // router.back() — navigates away from /new regardless of destination
    await page.waitForURL((url) => !url.pathname.endsWith("/new"), { timeout: NAV_TIMEOUT });
    await expect(page).not.toHaveURL(/\/new$/);
  });
});
