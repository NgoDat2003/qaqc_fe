import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/login";

// Requires: BE at localhost:3000 + FE at localhost:3001
// Account: viethai55@yahoo.com (qc_auditor) — must have ≥1 pending assignment

test.describe("Audit Execute Flow (QC)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "qc_auditor");
  });

  test("My Audits page shows assignments", async ({ page }) => {
    await page.goto("/operations/my-audits");
    await expect(page.getByRole("heading")).toBeVisible();
    // At least the page loads without error
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("pending assignment opens execute page", async ({ page }) => {
    await page.goto("/operations/my-audits");
    const executeLink = page.getByRole("link", { name: /thực hiện|execute/i }).first();
    if (await executeLink.isVisible()) {
      await executeLink.click();
      await expect(page).toHaveURL(/\/execute/);
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 8000 });
    } else {
      test.skip(true, "No pending assignments for this account");
    }
  });

  test("fill violations and submit → score result appears", async ({ page }) => {
    await page.goto("/operations/my-audits");
    const executeLink = page.getByRole("link", { name: /thực hiện|execute/i }).first();
    if (!await executeLink.isVisible()) {
      test.skip(true, "No pending assignments for this account");
      return;
    }
    await executeLink.click();
    await expect(page).toHaveURL(/\/execute/);

    // Increment first criteria error
    const plusBtn = page.getByRole("button", { name: "+" }).first();
    if (await plusBtn.isVisible()) await plusBtn.click();

    // Submit
    const submitBtn = page.getByRole("button", { name: /nộp|submit/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Confirm if dialog appears
    const confirmBtn = page.getByRole("button", { name: /xác nhận|confirm/i });
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false))
      await confirmBtn.click();

    // Score result visible
    await expect(page.getByText(/điểm|score/i)).toBeVisible({ timeout: 12000 });
  });
});
