import { Page } from "@playwright/test"

export const TEST_USERS = {
  admin: { email: "admin@test.com", password: "Test@1234", role: "company_admin" },
  qam: { email: "qam@test.com", password: "Test@1234", role: "qa_manager" },
  qc: { email: "qc@test.com", password: "Test@1234", role: "qc_auditor" },
  sm: { email: "sm@test.com", password: "Test@1234", role: "store_manager" },
  am: { email: "am@test.com", password: "Test@1234", role: "am" },
  ev: { email: "ev@test.com", password: "Test@1234", role: "executive_viewer" },
}

export async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const user = TEST_USERS[role]
  await page.goto("/login")
  await page.fill('[name="email"]', user.email)
  await page.fill('[name="password"]', user.password)
  await page.click('[type="submit"]')
  await page.waitForURL("/dashboard")
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]')
  await page.click('[data-testid="logout-btn"]')
  await page.waitForURL("/login")
}
