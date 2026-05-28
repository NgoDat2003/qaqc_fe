import type { Browser, Page } from "@playwright/test";
import { loginAs } from "./auth";
import type { E2ERole } from "./test-data";

export async function withRolePage<T>(
  browser: Browser,
  role: E2ERole,
  run: (page: Page) => Promise<T>,
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await loginAs(page, role);
    return await run(page);
  } finally {
    await context.close();
  }
}
