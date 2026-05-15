import { test, expect } from "@playwright/test";
import { loginAsAdmin, ADMIN_EMAIL, ADMIN_PASS, LOGIN_TIMEOUT, NAV_TIMEOUT, ELEMENT_TIMEOUT } from "./helpers/auth";

test.describe("Admin — Auth flow", () => {
  test("login page loads and shows form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible({ timeout: ELEMENT_TIMEOUT });
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("login with valid credentials → redirects to organization", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", ADMIN_EMAIL);
    await page.fill("input[type='password']", ADMIN_PASS);
    await page.click("button[type='submit']");
    await page.waitForURL("**/master-data/organization", { timeout: LOGIN_TIMEOUT });
    await expect(page).toHaveURL(/master-data\/organization/);
  });

  test("invalid credentials → stays on login page", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", "wrong@test.com");
    await page.fill("input[type='password']", "wrongpassword");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/login/);
  });

  test("/dashboard redirects to organization for admin", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard");
    await page.waitForURL("**/master-data/organization", { timeout: NAV_TIMEOUT });
    await expect(page).toHaveURL(/master-data\/organization/);
  });
});
