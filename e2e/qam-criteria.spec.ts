import { test, expect } from "@playwright/test";
import { loginAsQAM, ELEMENT_TIMEOUT } from "./helpers/auth";

// company_admin has BE access to QAM routes even though sidebar shows admin menu
// Navigate directly to /qam/* routes for testing

test.describe("QAM — Criteria Groups", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    await page.goto("/qam/criteria-groups");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("criteria groups page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Nhóm tiêu chí/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Thêm nhóm button opens drawer", async ({ page }) => {
    const btn = page.getByText(/Thêm nhóm/i).first();
    await expect(btn).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await btn.click();
    await expect(page.getByText("Thêm nhóm tiêu chí")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/VD: C, H, E, P/i)).toBeVisible();
  });

  test("drawer has code, name, color fields", async ({ page }) => {
    await page.getByText(/Thêm nhóm/i).first().click();
    await page.getByText("Thêm nhóm tiêu chí").waitFor({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/VD: C, H, E, P/i)).toBeVisible();
    await expect(page.getByPlaceholder(/VD: Vệ sinh, Dịch vụ/i)).toBeVisible();
    // Color picker
    await expect(page.locator("input[type='color']")).toBeVisible();
  });
});

test.describe("QAM — Criteria Library", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    await page.goto("/qam/criteria");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("criteria page loads with table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Thư viện tiêu chí/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("filter controls visible", async ({ page }) => {
    // Search input present
    await expect(page.locator("input[type='text'], input:not([type])").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    // At least 2 select/combobox controls visible (group + status filters)
    const selectCount = await page.locator("[data-slot='select-trigger'], select").count();
    expect(selectCount).toBeGreaterThanOrEqual(2);
  });

  test("Thêm tiêu chí button opens drawer", async ({ page }) => {
    await page.getByText(/Thêm tiêu chí/i).first().click();
    // After click, drawer opens — use heading role to avoid matching the button too
    await expect(page.getByRole("heading", { name: /Thêm tiêu chí/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/VD: C001/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Mô tả chi tiết tiêu chí/i)).toBeVisible();
    await expect(page.getByText("Bình thường").first()).toBeVisible();
  });
});
