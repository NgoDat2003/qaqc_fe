import { expect, type Page } from "@playwright/test";
import { apiPost } from "./api";
import { roleAccounts, type E2ERole } from "./test-data";

export const LOGIN_TIMEOUT = 30000;
export const NAV_TIMEOUT = 20000;
export const ELEMENT_TIMEOUT = 10000;

export const ADMIN_EMAIL = roleAccounts.admin.email;
export const ADMIN_PASS = roleAccounts.admin.password;
export const QAM_EMAIL = roleAccounts.qam.email;
export const QAM_PASS = roleAccounts.qam.password;

export async function loginAs(page: Page, role: E2ERole) {
  const account = roleAccounts[role];
  await apiPost(page.request, "/api/auth/login", account);
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/dashboard", { timeout: LOGIN_TIMEOUT, waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
  await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {});
}

export async function loginViaForm(page: Page, role: E2ERole) {
  const account = roleAccounts[role];
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const emailInput = page.locator("#email");
  const passwordInput = page.locator("#password");
  await expect(emailInput).toBeEditable({ timeout: ELEMENT_TIMEOUT });
  await emailInput.fill(account.email);
  await expect(emailInput).toHaveValue(account.email);
  await passwordInput.fill(account.password);
  await expect(passwordInput).toHaveValue(account.password);
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard", { timeout: LOGIN_TIMEOUT, waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {});
}

export async function logout(page: Page) {
  await page.request.post("/api/auth/logout").catch(() => {});
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" }).catch(async () => {
    await page.waitForTimeout(500);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
  });
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, "admin");
}

export async function loginAsQAM(page: Page) {
  await loginAs(page, "qam");
}
