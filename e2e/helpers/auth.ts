import type { Page } from "@playwright/test";

// Longer timeout — BE on Supabase Singapore can be slow (~300-500ms per request)
export const LOGIN_TIMEOUT = 30000;
export const NAV_TIMEOUT = 20000;
export const ELEMENT_TIMEOUT = 10000;

export const ADMIN_EMAIL = "admin@qualityops.com";
export const ADMIN_PASS = "Test@1234";

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.fill("input[type='email'], input[name='email']", ADMIN_EMAIL);
  await page.fill("input[type='password']", ADMIN_PASS);
  await page.click("button[type='submit']");
  await page.waitForURL("**/master-data/organization", { timeout: LOGIN_TIMEOUT });
  // Wait for page to finish loading data
  await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {});
}
