import type { Page } from "@playwright/test";

// Longer timeout — BE on Supabase Singapore can be slow (~300-500ms per request)
export const LOGIN_TIMEOUT = 30000;
export const NAV_TIMEOUT = 20000;
export const ELEMENT_TIMEOUT = 10000;

export const ADMIN_EMAIL = "admin@qualityops.com";
export const ADMIN_PASS  = "Test@1234";

export const QAM_EMAIL = "ngoclam.le3@gmail.com";
export const QAM_PASS  = "Test@1234";

async function loginAs(page: Page, email: string, password: string, expectedUrlPattern: string) {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.fill("input[type='email'], input[name='email']", email);
  await page.fill("input[type='password']", password);
  await page.click("button[type='submit']");
  await page.waitForURL(expectedUrlPattern, { timeout: LOGIN_TIMEOUT });
  await page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {});
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASS, "**/master-data/organization");
}

// QA Manager login — same redirect as admin, then navigate to QAM routes
export async function loginAsQAM(page: Page) {
  await loginAs(page, QAM_EMAIL, QAM_PASS, "**/master-data/organization");
}
