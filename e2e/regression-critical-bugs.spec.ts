import { test, expect } from "@playwright/test";
import { apiGet } from "./helpers/api";
import { loginAs } from "./helpers/auth";
import { createFreshE2EActionPlanForSM } from "./helpers/flows";
import { makeE2EName, makeRunId } from "./helpers/test-data";

interface AuditResultListItem {
  id: string;
  store: { name: string };
}

interface ActionPlanDetail {
  id: string;
  items: Array<{
    rootCause: string | null;
    remediation: string | null;
    fixedAt: string | null;
    assigneeName: string | null;
  }>;
}

test("audits list opens detail by auditId, not assignmentId", async ({ page }) => {
  await loginAs(page, "qam");
  const audits = await apiGet<AuditResultListItem[]>(page.request, "/api/audits");
  test.skip(audits.length === 0, "No submitted audit available for read-only regression.");
  const audit = audits[0];

  await page.goto("/audits");
  await page.getByText(audit.store.name).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/audits/${audit.id}`));
  await expect(page.getByText(/không thể tải|404/i)).toHaveCount(0);
});

test.describe("Action Plan mutation regressions", () => {
  test.setTimeout(120_000);
  test.skip(process.env.E2E_ALLOW_MUTATION !== "true", "Set E2E_ALLOW_MUTATION=true only on a disposable test database.");

  test("fresh E2E action plan starts with missing fields visible to SM", async ({ page }) => {
    const planName = makeE2EName("AP Regression", makeRunId());
    const apContext = await createFreshE2EActionPlanForSM(page, page.request, planName);

    await loginAs(page, "sm");
    await page.goto(`/action-plans/${apContext.actionPlanId}`);
    const initial = await apiGet<ActionPlanDetail>(page.request, `/api/action-plans/${apContext.actionPlanId}`);
    expect(initial.items.some((item) => !item.rootCause || !item.remediation || !item.fixedAt || !item.assigneeName)).toBe(true);
    await expect(page.getByText(/nguyên nhân|root cause/i).first()).toBeVisible();
  });
});
