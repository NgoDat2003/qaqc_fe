import { test, expect } from "@playwright/test";
import path from "node:path";
import { assertApiEnvelope, assertApiReachable } from "./helpers/api";
import { resolveSuitableSeed, validateEvidenceFixture, verifyRoleLoginsIsolated } from "./helpers/preflight";
import { withRolePage } from "./helpers/session";
import { evidenceFixtures } from "./helpers/test-data";

test.describe("E2E preflight", () => {
  test.setTimeout(90_000);

  test("FE and BE API contracts are reachable", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();

    const authStatus = await assertApiReachable(page.request, "/api/auth/me");
    expect(authStatus.status).toBeLessThan(500);
  });

  test("role accounts can login with isolated sessions", async ({ browser }) => {
    await verifyRoleLoginsIsolated(browser);
  });

  test("seed data supports mutation lifecycle", async ({ browser }) => {
    await withRolePage(browser, "qam", async (page) => {
      await assertApiEnvelope(page.request, "/api/stores");
      await assertApiEnvelope(page.request, "/api/users?role=qc_auditor");
      await assertApiEnvelope(page.request, "/api/checklists?status=published");
      await resolveSuitableSeed(page.request);
    });

    await validateEvidenceFixture(path.join(process.cwd(), evidenceFixtures.audit));
    await validateEvidenceFixture(path.join(process.cwd(), evidenceFixtures.remediation));
  });
});
