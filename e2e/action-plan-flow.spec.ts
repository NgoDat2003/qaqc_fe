import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/login";

// Requires: BE at localhost:3000 + FE at localhost:3001
// SM: linhchau43@hotmail.com — must have ≥1 AP in draft/rejected
// QAM: nguyetcat.ho64@gmail.com — must have ≥1 AP in submitted

test.describe("Action Plan Flow — SM submit → QAM close", () => {
  test("SM can view action plan list", async ({ page }) => {
    await loginAs(page, "store_manager");
    await page.goto("/operations/action-plan");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("SM fills and submits draft AP", async ({ page }) => {
    await loginAs(page, "store_manager");
    await page.goto("/operations/action-plan");

    const draftLink = page.getByRole("link").filter({ hasText: /draft/i }).first();
    if (!await draftLink.isVisible()) {
      test.skip(true, "No draft AP for SM account");
      return;
    }
    await draftLink.click();
    await expect(page).toHaveURL(/\/action-plan\//);

    await page.getByPlaceholder(/mô tả|describe/i).fill("Đã khắc phục và vệ sinh khu vực FOH hàng ngày");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    await page.locator('input[type="date"]').fill(tomorrow.toISOString().slice(0, 10));

    await page.getByRole("button", { name: /submit|gửi/i }).click();
    await expect(page.getByText(/submitted/i)).toBeVisible({ timeout: 8000 });
  });

  test("QAM closes a submitted AP", async ({ page }) => {
    await loginAs(page, "qa_manager");
    await page.goto("/operations/action-plan");

    const submittedLink = page.getByRole("link").filter({ hasText: /submitted/i }).first();
    if (!await submittedLink.isVisible()) {
      test.skip(true, "No submitted AP for QAM to review");
      return;
    }
    await submittedLink.click();
    await expect(page).toHaveURL(/\/action-plan\//);

    await page.getByRole("button", { name: /close action plan/i }).click();
    await expect(page.getByText(/closed/i)).toBeVisible({ timeout: 8000 });
  });

  test("QAM rejects a submitted AP", async ({ page }) => {
    await loginAs(page, "qa_manager");
    await page.goto("/operations/action-plan");

    const submittedLink = page.getByRole("link").filter({ hasText: /submitted/i }).first();
    if (!await submittedLink.isVisible()) {
      test.skip(true, "No submitted AP for QAM to reject");
      return;
    }
    await submittedLink.click();
    await page.getByRole("button", { name: /reject/i }).click();
    await expect(page.getByText(/rejected/i)).toBeVisible({ timeout: 8000 });
  });
});
