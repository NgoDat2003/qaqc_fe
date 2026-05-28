import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { apiGet } from "../../helpers/api";
import type { HumanDriver } from "../../portfolio-driver";
import type { GoldenFlowSeed } from "../../support/golden-flow-seed";
import { selectComboboxByOptionTestId, waitForPageReady } from "../_shared";

interface ChecklistRef {
  id: string;
  name: string;
  version: string;
  status: string;
}

interface StoreRef {
  id: string;
  code: string;
  name: string;
}

interface UserRef {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

interface AuditPlanDetail {
  id: string;
  name: string;
  status: string;
  assignments: Array<{
    id: string;
    auditId: string | null;
    store?: { name: string; code: string };
  }>;
}

export interface CreatedPlanContext {
  planId: string;
  planName: string;
  assignmentId: string;
  storeName: string;
}

export async function createAndAssignPlanByUi(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  input: { planName: string; seed: GoldenFlowSeed },
): Promise<CreatedPlanContext> {
  const refs = await resolvePlanRefs(request, input.seed);
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  await page.goto("/qam/audit-plans/new", { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);
  await driver.type(page.getByTestId("audit-plan-name-input"), input.planName, { clear: true });
  await selectComboboxByOptionTestId(
    driver,
    page.getByTestId("audit-plan-checklist-combobox"),
    `audit-plan-checklist-combobox-option-${refs.checklist.id}`,
  );
  await page.getByTestId("audit-plan-start-date-input").fill(toDateInput(start));
  await page.getByTestId("audit-plan-end-date-input").fill(toDateInput(end));

  await driver.click(page.getByTestId("audit-plan-add-store-button"));
  await page.getByTestId(`audit-plan-store-dialog-checkbox-${refs.store.id}`).check();
  await driver.click(page.getByTestId("audit-plan-add-selected-stores-button"));

  const qcTrigger = page.locator("[data-testid^='audit-plan-qc-combobox-']").first();
  await driver.click(qcTrigger);
  await driver.click(page.locator(`[data-testid$="-option-${refs.qc.id}"]`).first());

  const createResponse = page.waitForResponse(
    (response) => response.url().includes("/api/audit-plans") &&
      response.request().method() === "POST" &&
      response.status() < 400,
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("audit-plan-create-button"));
  const createdPlanResponse = await createResponse;
  const createdPlan = await unwrapPlanResponse(createdPlanResponse);
  const planId = createdPlan.id;
  await page.waitForURL(new RegExp(`/qam/audit-plans/${planId}$`), { timeout: 30_000 }).catch(async () => {
    await page.goto(`/qam/audit-plans/${planId}`, { waitUntil: "domcontentloaded" });
  });

  await expect(page.getByText(input.planName)).toBeVisible({ timeout: 20_000 });
  await driver.pause("plan-created");

  const currentDetail = await apiGet<AuditPlanDetail>(request, `/api/audit-plans/${planId}`);
  if (currentDetail.status === "open" && currentDetail.assignments.length > 0) {
    return toCreatedPlanContext(currentDetail, refs.store.name);
  }

  const publishResponse = page.waitForResponse(
    (response) => response.url().includes(`/api/audit-plans/${planId}/publish`) &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("audit-plan-publish-button"));
  await expect(page.getByTestId("audit-plan-publish-confirm-button")).toBeVisible({ timeout: 10_000 });
  await driver.click(page.getByTestId("audit-plan-publish-confirm-button"));
  const response = await publishResponse;
  if (!response.ok()) throw new Error(`Publish audit plan failed with ${response.status()}: ${await response.text()}`);

  const detail = await pollPlanOpen(request, planId);
  return toCreatedPlanContext(detail, refs.store.name);
}

async function resolvePlanRefs(request: APIRequestContext, seed: GoldenFlowSeed) {
  const [checklists, stores, qcs] = await Promise.all([
    apiGet<ChecklistRef[]>(request, "/api/checklists?status=published"),
    apiGet<StoreRef[]>(request, "/api/stores"),
    apiGet<UserRef[]>(request, "/api/users?role=qc_auditor"),
  ]);
  const checklist = checklists.find((item) => item.id === seed.checklistId) ??
    checklists.find((item) =>
      item.name === seed.checklistName &&
      item.version === seed.checklistVersion,
    );
  const store = stores.find((item) => item.id === seed.storeId) ??
    stores.find((item) => item.code === seed.storeCode);
  const qc = qcs.find((item) => item.email.toLowerCase() === seed.qcEmail.toLowerCase() && item.isActive);
  if (!checklist) throw new Error(`No published checklist found for ${seed.checklistName} v${seed.checklistVersion}.`);
  if (!store) throw new Error(`No store found for code ${seed.storeCode}.`);
  if (!qc) throw new Error(`No active QC found for ${seed.qcEmail}.`);
  return { checklist, store, qc };
}

async function pollPlanOpen(request: APIRequestContext, planId: string) {
  const startedAt = Date.now();
  let last: AuditPlanDetail | undefined;
  while (Date.now() - startedAt < 30_000) {
    last = await apiGet<AuditPlanDetail>(request, `/api/audit-plans/${planId}`);
    if (last.status === "open" && last.assignments.length > 0) return last;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Audit plan did not open in time. Last: ${JSON.stringify(last)}`);
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toCreatedPlanContext(detail: AuditPlanDetail, fallbackStoreName: string): CreatedPlanContext {
  const assignment = detail.assignments[0];
  if (!assignment) throw new Error(`Audit plan ${detail.id} has no assignments.`);
  return {
    planId: detail.id,
    planName: detail.name,
    assignmentId: assignment.id,
    storeName: assignment.store?.name ?? fallbackStoreName,
  };
}

async function unwrapPlanResponse(response: { json(): Promise<unknown> }) {
  const json = await response.json() as {
    success?: boolean;
    data?: { id?: string };
    error?: { message?: string } | string;
  };
  if (!json.success || !json.data?.id) {
    const message = typeof json.error === "string" ? json.error : json.error?.message ?? "Unexpected create plan response";
    throw new Error(message);
  }
  return { id: json.data.id };
}
