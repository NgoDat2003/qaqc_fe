import { test, expect } from "@playwright/test";
import { loginAsAdmin, ELEMENT_TIMEOUT } from "./helpers/auth";

test.describe("Admin — Organization page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Wait for page to hydrate, then ensure Stores tab is active
    const storesTab = page.getByRole("tab", { name: "Cửa hàng" });
    await storesTab.waitFor({ state: "visible", timeout: 15000 });
    await storesTab.click();
    await page.waitForTimeout(300);
  });

  test("sidebar shows admin menu items", async ({ page }) => {
    const nav = page.locator("[data-slot='sidebar-content']");
    await expect(nav.getByText("Thương hiệu & Cửa hàng").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(nav.getByText("Người dùng").first()).toBeVisible();
  });

  test("tabs Cửa hàng + Thương hiệu visible", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Cửa hàng" })).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.getByRole("tab", { name: "Thương hiệu" })).toBeVisible();
  });

  test("stores tab — table renders with header row", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("thead tr")).toBeVisible();
  });

  test("brands tab — table renders", async ({ page }) => {
    await page.getByRole("tab", { name: "Thương hiệu" }).click();
    await expect(page.locator("thead").getByText("Số cửa hàng")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("search input present on stores tab", async ({ page }) => {
    // Any visible text input on the page
    await expect(page.locator("input[type='text'], input:not([type])").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Thêm cửa hàng button opens StoreDrawer", async ({ page }) => {
    // Use getByText to find any element containing the text
    const btn = page.getByText(/Thêm cửa hàng/i).first();
    await expect(btn).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await btn.click();
    await expect(page.getByText("Tạo cửa hàng mới")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("StoreDrawer province combobox is searchable", async ({ page }) => {
    await page.getByText(/Thêm cửa hàng/i).first().click();
    await page.getByText("Tạo cửa hàng mới").waitFor({ timeout: ELEMENT_TIMEOUT });

    const provinceBtn = page.getByText(/Chọn tỉnh\/thành/i).first();
    await expect(provinceBtn).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await provinceBtn.click();
    await expect(page.getByPlaceholder("Nhập để tìm...")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await page.getByPlaceholder("Nhập để tìm...").fill("Hà");
    await expect(page.getByText("Thành phố Hà Nội").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("Thêm thương hiệu button opens BrandDrawer", async ({ page }) => {
    await page.getByRole("tab", { name: "Thương hiệu" }).click();
    const btn = page.locator("button").filter({ hasText: "Thêm thương hiệu" }).first();
    await expect(btn).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await btn.click();
    await expect(page.getByText("Thêm thương hiệu mới")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });

  test("page heading visible", async ({ page }) => {
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  });
});
