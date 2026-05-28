import { expect, type Page } from "@playwright/test";
import type { HumanDriver } from "../../portfolio-driver";
import { roleAccounts, type E2ERole } from "../../helpers/test-data";

export async function loginByForm(page: Page, driver: HumanDriver, role: E2ERole) {
  const account = roleAccounts[role];
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const email = page.locator("#email");
  const password = page.locator("#password");
  await expect(email).toBeEditable({ timeout: 15_000 });
  await driver.type(email, account.email, { clear: true });
  await driver.type(password, account.password, { clear: true });
  await driver.click(page.locator("button[type='submit']"));
  await page.waitForURL("**/dashboard", { timeout: 30_000, waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 });
}
