import { test, expect } from "@playwright/test";
import { loginAsQAM, ELEMENT_TIMEOUT } from "./helpers/auth";

test.describe("QAM — Checklists", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    await page.goto("/qam/checklists");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("checklist list page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Checklist/i })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("status filter tabs visible", async ({ page }) => {
    await expect(page.getByText("Tất cả").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Draft").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Đã publish").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("metric cards show draft/published/archived counts", async ({ page }) => {
    // Use first() — "Draft" appears in both tab button and metric card label
    await expect(page.getByText("Draft").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Đã publish").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByText("Lưu trữ").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Tạo checklist button opens dialog", async ({ page }) => {
    await page.getByText(/Tạo checklist/i).first().click();
    await expect(page.getByText("Tạo checklist mới")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByPlaceholder(/VD: Checklist CHEP/i)).toBeVisible();
    // Version field
    await expect(page.getByPlaceholder("1.0")).toBeVisible();
  });

  test("filter tabs switch content", async ({ page }) => {
    // Click Draft tab
    await page.getByText("Draft").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });
});

test.describe("QAM — Checklist Builder", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsQAM(page);
    // Navigate to the first checklist in the list (if any exist)
    await page.goto("/qam/checklists");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  });

  test("clicking Mở builder navigates to builder page", async ({ page }) => {
    // Look for a checklist row with "Mở builder" button
    const builderBtn = page.getByText("Mở builder").first();
    const hasChecklists = await builderBtn.isVisible().catch(() => false);

    if (hasChecklists) {
      await builderBtn.click();
      // Should navigate to /qam/checklists/[id]
      await expect(page).toHaveURL(/\/qam\/checklists\/[^/]+$/, { timeout: 10000 });
      // Builder shows heading
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    } else {
      // No checklists yet — verify empty state
      await expect(page.getByText(/Chưa có checklist nào/i)).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    }
  });
});
