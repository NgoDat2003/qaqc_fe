import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { apiGet } from "../../helpers/api";
import type { HumanDriver } from "../../portfolio-driver";
import type { SubmittedAuditContext } from "../qc/audit-execution-actions";

interface AuditResultListItem {
  id: string;
  actionPlan: { id: string; status: string } | null;
}

export interface ActionPlanContext extends SubmittedAuditContext {
  actionPlanId: string;
}

export async function createActionPlanFromAuditByUi(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  audit: SubmittedAuditContext,
): Promise<ActionPlanContext> {
  await page.goto(`/audits/${audit.auditId}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/audits/${audit.auditId}`));
  await driver.pause("qam-audit-result");

  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/audits/${audit.auditId}/action-plan`) &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("create-action-plan-from-audit-button"));
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(`Create action plan failed with ${response.status()}: ${await response.text()}`);
  }
  const actionPlanId = await pollActionPlanId(request, audit.auditId);
  await page.waitForURL(new RegExp(`/action-plans/${actionPlanId}`), { timeout: 30_000 }).catch(async () => {
    await page.goto(`/action-plans/${actionPlanId}`, { waitUntil: "domcontentloaded" });
  });
  await driver.pause("qam-action-plan-created");
  return { ...audit, actionPlanId };
}

async function pollActionPlanId(request: APIRequestContext, auditId: string) {
  const startedAt = Date.now();
  let last: AuditResultListItem[] = [];
  while (Date.now() - startedAt < 30_000) {
    last = await apiGet<AuditResultListItem[]>(request, "/api/audits");
    const audit = last.find((item) => item.id === auditId && item.actionPlan?.id);
    if (audit?.actionPlan?.id) return audit.actionPlan.id;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Action Plan was not linked to audit ${auditId}. Last audit count: ${last.length}`);
}
