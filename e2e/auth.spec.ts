import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/login";
import { ACCOUNTS } from "./test-accounts";

test.describe("Auth guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: /đăng nhập/i })).toBeVisible();
  });

  test("QAM login → dashboard", async ({ page }) => {
    await loginAs(page, "qa_manager");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("wrong password → stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ACCOUNTS.qa_manager.email);
    await page.getByLabel(/mật khẩu|password/i).fill("WrongPassword!");
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
