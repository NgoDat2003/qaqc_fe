import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { apiGet } from "../../helpers/api";
import { evidenceFixtures } from "../../helpers/test-data";
import type { HumanDriver } from "../../portfolio-driver";
import type { ActionPlanContext } from "../qam/audit-result-actions";

interface ActionPlanDetail {
  id: string;
  status: "draft" | "submitted" | "rejected" | "closed";
  items: Array<{
    id: string;
    issueCause: string | null;
    rootCause: string | null;
    remediation: string | null;
    fixedAt: string | null;
    assigneeName: string | null;
    remediationImages: Array<{ id: string }>;
    violation: {
      note: string | null;
      criteria: { code: string; flag: "none" | "critical" | "risk" };
      isCriticalTriggered: boolean;
      isRiskTriggered: boolean;
    };
  }>;
}

export async function submitRemediationByUi(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  context: ActionPlanContext,
) {
  await page.goto(`/action-plans/${context.actionPlanId}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/action-plans/${context.actionPlanId}`));
  let detail = await apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`);
  if (detail.status !== "draft" && detail.status !== "rejected") {
    throw new Error(`SM can only submit draft/rejected AP. Current status: ${detail.status}`);
  }

  for (const item of detail.items) {
    const issueCause = item.issueCause ?? item.violation.note;
    if (issueCause) await expect(page.getByText(issueCause).first()).toBeVisible({ timeout: 15_000 });
    await fillActionPlanItem(page, driver, context.actionPlanId, item);
  }

  detail = await waitActionPlanSaved(request, context.actionPlanId);
  if (!detail.items.length) throw new Error("Action Plan has no items to submit.");
  await driver.pause("sm-remediation-filled");

  const submitResponse = page.waitForResponse(
    (response) => response.url().includes(`/api/action-plans/${context.actionPlanId}/submit`) &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("action-plan-submit-button"));
  const response = await submitResponse;
  if (!response.ok()) {
    throw new Error(`Submit action plan failed with ${response.status()}: ${await response.text()}`);
  }
  await expect.poll(
    async () => (await apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`)).status,
    { timeout: 30_000 },
  ).toBe("submitted");
}

async function fillActionPlanItem(
  page: Page,
  driver: HumanDriver,
  actionPlanId: string,
  item: ActionPlanDetail["items"][number],
) {
  const needsImages = item.violation.criteria.flag !== "none" ||
    item.violation.isCriticalTriggered ||
    item.violation.isRiskTriggered;
  const patchResponse = page.waitForResponse(
    (response) => response.url().includes(`/api/action-plans/${actionPlanId}`) &&
      response.request().method() === "PATCH" &&
      response.status() < 400,
    { timeout: 35_000 },
  );
  await driver.type(page.getByTestId(`ap-root-cause-${item.id}`), `E2E root cause ${item.violation.criteria.code}`, { clear: true });
  await driver.type(page.getByTestId(`ap-remediation-${item.id}`), `E2E remediation ${item.violation.criteria.code}`, { clear: true });
  await page.getByTestId(`ap-fixed-at-${item.id}`).fill(new Date().toISOString().slice(0, 10));
  await driver.type(page.getByTestId(`ap-assignee-${item.id}`), "E2E Store Manager", { clear: true });
  if (needsImages) {
    await page.getByTestId(`ap-gallery-input-${item.id}`).setInputFiles(evidenceFixtures.remediation);
  }
  await patchResponse;
}

async function waitActionPlanSaved(request: APIRequestContext, actionPlanId: string) {
  const startedAt = Date.now();
  let last: ActionPlanDetail | undefined;
  while (Date.now() - startedAt < 35_000) {
    last = await apiGet<ActionPlanDetail>(request, `/api/action-plans/${actionPlanId}`);
    const complete = last.items.every((item) => {
      const needsImages = item.violation.criteria.flag !== "none" ||
        item.violation.isCriticalTriggered ||
        item.violation.isRiskTriggered;
      return Boolean(item.rootCause?.trim()) &&
        Boolean(item.remediation?.trim()) &&
        Boolean(item.fixedAt) &&
        Boolean(item.assigneeName?.trim()) &&
        (!needsImages || item.remediationImages.length > 0);
    });
    if (complete) return last;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Action Plan did not save remediation data in time. Last: ${JSON.stringify(last)}`);
}
