import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { AccountRole } from "../test-accounts";
import { ACCOUNTS } from "../test-accounts";

export async function loginAs(page: Page, role: AccountRole) {
  const account = ACCOUNTS[role];
  await page.goto("/login");
  await page.locator("#email").fill(account.email);
  await page.locator("#password").fill(account.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
}
