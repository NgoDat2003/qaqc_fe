import { expect, type APIRequestContext, type Page } from "@playwright/test";
import path from "node:path";
import { apiGet, apiPatch, apiPost } from "./api";
import { loginAs, logout } from "./auth";
import { pollUntil } from "./polling";
import { assertMutationEnvironment, getFirstRegularCriteria, resolveSuitableSeed } from "./preflight";

interface AuditPlanFull {
  id: string;
  name: string;
  status: "draft" | "open" | "closed";
  assignments: Array<{ id: string; auditId: string | null; status: string }>;
}

interface MyAssignment {
  id: string;
  auditId: string | null;
  store: { id: string; code: string; name: string };
  plan: { id: string; name: string };
}

interface AuditSession {
  assignment: { id: string; status: "pending" | "in_progress" | "completed" };
  checklist: Parameters<typeof getFirstRegularCriteria>[0];
  riskCriteria?: Array<{ id: string; code: string; flag: "risk"; name: string }>;
}

interface SubmitAuditResponse {
  id: string;
}

interface AuditResultListItem {
  id: string;
  actionPlan: { id: string; status: string } | null;
  store: { id: string; name: string; code: string };
}

interface ActionPlanDetail {
  id: string;
  status: "draft" | "submitted" | "rejected" | "closed";
  items: Array<{
    id: string;
    rootCause: string | null;
    remediation: string | null;
    fixedAt: string | null;
    assigneeName: string | null;
    remediationImages: Array<{ id: string }>;
    violation: {
      criteria: { code: string; flag: "none" | "critical" | "risk" };
      isCriticalTriggered: boolean;
      isRiskTriggered: boolean;
    };
  }>;
}

interface UploadedImage {
  id: string;
}

export interface AuditPlanContext {
  planId: string;
  planName: string;
  assignmentId: string;
  storeName: string;
}

export interface AuditContext extends AuditPlanContext {
  auditId: string;
}

export interface ActionPlanContext extends AuditContext {
  actionPlanId: string;
}

export async function createAndPublishAuditPlan(
  page: Page,
  request: APIRequestContext,
  options: { planName: string },
): Promise<AuditPlanContext> {
  assertMutationEnvironment();
  const seed = await resolveSuitableSeed(request);
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 7);

  const plan = await apiPost<AuditPlanFull>(request, "/api/audit-plans", {
    name: options.planName,
    formId: seed.checklist.id,
    startDate: today.toISOString(),
    endDate: end.toISOString(),
    assignments: [{ storeId: seed.store.id, auditorId: seed.qc.id }],
  });

  await page.goto(`/qam/audit-plans/${plan.id}`);
  await expect(page.getByText(options.planName)).toBeVisible();
  await demoPause(page);

  await apiPost<AuditPlanFull>(request, `/api/audit-plans/${plan.id}/publish`, {});
  const published = await pollUntil(
    () => apiGet<AuditPlanFull>(request, `/api/audit-plans/${plan.id}`),
    (value) => value.status === "open" && value.assignments.length > 0,
  );
  return {
    planId: published.id,
    planName: published.name,
    assignmentId: published.assignments[0].id,
    storeName: seed.store.name,
  };
}

export async function executeAuditAsQC(
  page: Page,
  request: APIRequestContext,
  context: AuditPlanContext,
): Promise<AuditContext> {
  const assignments = await apiGet<MyAssignment[]>(request, "/api/audit-plans/my-assignments");
  const assignment = assignments.find((item) => item.id === context.assignmentId || item.plan.id === context.planId);
  if (!assignment) throw new Error(`QC assignment not found for plan ${context.planName}.`);

  await page.goto("/qc/my-assignments");
  await expect(page.getByRole("heading", { name: /việc của tôi|my assignments/i })).toBeVisible();
  await demoPause(page);
  await page.goto(`/qc/audits/${assignment.id}`);
  await demoPause(page);

  const session = await apiGet<AuditSession>(request, `/api/audits/assignments/${assignment.id}`);
  const regular = getFirstRegularCriteria(session.checklist);
  const risk = session.riskCriteria?.[0] ??
    session.checklist.sections
      .flatMap((section) => section.items ?? [])
      .map((item) => item.criteria)
      .find((criteria): criteria is { id: string; code: string; flag: "risk" | "critical"; name: string } =>
        criteria?.flag === "risk" || criteria?.flag === "critical",
      );
  if (!regular || !risk) throw new Error("Audit session lacks regular and Risk/CCP criteria.");

  const submitted = await apiPost<SubmitAuditResponse>(request, "/api/audits/submit", {
    assignmentId: assignment.id,
    violations: [
      { criteriaId: regular.id, numErrors: 1, note: "E2E regular issue" },
      { criteriaId: risk.id, numErrors: 1, note: "E2E risk issue" },
    ],
  });

  return { ...context, assignmentId: assignment.id, auditId: submitted.id };
}

export async function executeAuditThroughUiAsQC(
  page: Page,
  request: APIRequestContext,
  context: AuditPlanContext,
  options: { onFilledBeforeSubmit?: () => Promise<void> } = {},
): Promise<AuditContext> {
  const assignments = await apiGet<MyAssignment[]>(request, "/api/audit-plans/my-assignments");
  const assignment = assignments.find((item) => item.id === context.assignmentId || item.plan.id === context.planId);
  if (!assignment) throw new Error(`QC assignment not found for plan ${context.planName}.`);

  const session = await apiGet<AuditSession>(request, `/api/audits/assignments/${assignment.id}`);
  const regular = getFirstRegularCriteria(session.checklist);
  const special = getFirstSpecialCriteria(session);
  if (!regular || !special) {
    throw new Error("Audit session lacks regular and Risk/CCP criteria for portfolio demo.");
  }

  await page.goto("/qc/my-assignments");
  await demoPause(page);
  await page.goto(`/qc/audits/${assignment.id}`);
  await hideNextDevOverlay(page);
  await expect(page.getByTestId(`criteria-card-${regular.id}`)).toBeVisible();

  await fillCriteriaViolation(page, regular.id, "E2E regular issue for portfolio demo");
  await page.getByTestId(special.tabTestId).click();
  await expect(page.getByTestId(`criteria-card-${special.id}`)).toBeVisible();

  const draftSaved = page.waitForResponse(
    (response) =>
      response.url().includes("/api/audits/draft") &&
      response.request().method() === "PATCH" &&
      response.status() < 400,
    { timeout: 20_000 },
  );
  await fillCriteriaViolation(page, special.id, "E2E risk issue for portfolio demo");
  await draftSaved;
  await expect(page.getByTestId("draft-status-saved")).toBeVisible({ timeout: 10_000 });
  await hideNextDevOverlay(page);
  await demoPause(page);
  await options.onFilledBeforeSubmit?.();

  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/audits/submit") &&
      response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByTestId("submit-audit-button").click();
  await page.getByTestId("confirm-submit-audit-button").click();
  const submitResponse = await submitResponsePromise;
  if (!submitResponse.ok()) {
    throw new Error(`/api/audits/submit failed with ${submitResponse.status()}: ${await submitResponse.text()}`);
  }
  const submitted = await unwrapSubmitResponse(submitResponse);
  await demoPause(page);

  return { ...context, assignmentId: assignment.id, auditId: submitted.id };
}

export async function createActionPlanFromAuditResult(
  page: Page,
  request: APIRequestContext,
  context: AuditContext,
): Promise<ActionPlanContext> {
  await page.goto(`/audits/${context.auditId}`);
  await expect(page).toHaveURL(new RegExp(`/audits/${context.auditId}`));
  await demoPause(page);

  const ap = await apiPost<ActionPlanDetail>(request, `/api/audits/${context.auditId}/action-plan`, {});
  await pollUntil(
    () => apiGet<AuditResultListItem[]>(request, "/api/audits"),
    (items) => items.some((audit) => audit.id === context.auditId && audit.actionPlan?.id === ap.id),
  );

  return { ...context, actionPlanId: ap.id };
}

export async function submitActionPlanAsSM(
  page: Page,
  request: APIRequestContext,
  context: ActionPlanContext,
) {
  await page.goto(`/action-plans/${context.actionPlanId}`);
  await expect(page).toHaveURL(new RegExp(`/action-plans/${context.actionPlanId}`));
  await demoPause(page);
  let ap = await apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`);
  const imageIdsByItem = new Map<string, string[]>();
  for (const item of ap.items) {
    if (needsRemediationImage(item)) {
      imageIdsByItem.set(item.id, [await uploadEvidence(request)]);
    }
  }

  await apiPatch<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`, {
    items: ap.items.map((item) => ({
      itemId: item.id,
      rootCause: `E2E root cause ${item.violation.criteria.code}`,
      remediation: `E2E remediation ${item.violation.criteria.code}`,
      fixedAt: new Date().toISOString(),
      assigneeName: "E2E Store Manager",
      imageIds: imageIdsByItem.get(item.id) ?? [],
    })),
  });

  ap = await apiPost<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}/submit`, {});
  expect(ap.status).toBe("submitted");
  await pollUntil(
    () => apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`),
    (value) => value.status === "submitted",
  );
}

export async function closeActionPlanAsQAM(
  page: Page,
  request: APIRequestContext,
  context: ActionPlanContext,
) {
  await page.goto(`/action-plans/${context.actionPlanId}`);
  await demoPause(page);
  const ap = await apiPost<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}/close`, {});
  expect(ap.status).toBe("closed");
  await pollUntil(
    () => apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`),
    (value) => value.status === "closed",
  );
  await page.reload();
  await expect(page.getByText(/đã đóng|closed/i).first()).toBeVisible();
}

export async function createFreshE2EActionPlanForSM(page: Page, request: APIRequestContext, planName: string) {
  await loginAs(page, "qam");
  const plan = await createAndPublishAuditPlan(page, request, { planName });
  await logout(page);
  await loginAs(page, "qc");
  const audit = await executeAuditAsQC(page, request, plan);
  await logout(page);
  await loginAs(page, "qam");
  const actionPlan = await createActionPlanFromAuditResult(page, request, audit);
  await logout(page);
  return actionPlan;
}

function needsRemediationImage(item: ActionPlanDetail["items"][number]) {
  return item.violation.criteria.flag !== "none" ||
    item.violation.isCriticalTriggered ||
    item.violation.isRiskTriggered;
}

function getFirstSpecialCriteria(session: AuditSession) {
  const risk = session.riskCriteria?.[0];
  if (risk) return { id: risk.id, tabTestId: "section-tab-virtual-risk" };

  const critical = session.checklist.sections
    .flatMap((section) => section.items ?? [])
    .map((item) => item.criteria)
    .find((criteria): criteria is { id: string; code: string; flag: "critical"; name: string } =>
      criteria?.flag === "critical",
    );
  if (critical) return { id: critical.id, tabTestId: "section-tab-virtual-ccp" };

  return null;
}

async function fillCriteriaViolation(page: Page, criteriaId: string, note: string) {
  await page.getByTestId(`criteria-increment-${criteriaId}`).click();
  await page.getByTestId(`criteria-note-${criteriaId}`).fill(note);
  await expect(page.getByTestId(`criteria-note-${criteriaId}`)).toHaveValue(note);
}

async function unwrapSubmitResponse(response: { json(): Promise<unknown> }) {
  const json = await response.json() as { success?: boolean; data?: SubmitAuditResponse; error?: { message?: string } | string };
  if (!json.success || !json.data?.id) {
    const message = typeof json.error === "string" ? json.error : json.error?.message ?? "Unexpected submit response";
    throw new Error(message);
  }
  return json.data;
}

async function hideNextDevOverlay(page: Page) {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; pointer-events: none !important; }",
  }).catch(() => {});
  await page.locator("nextjs-portal").evaluateAll((nodes) => {
    for (const node of nodes) {
      (node as HTMLElement).style.display = "none";
      (node as HTMLElement).style.pointerEvents = "none";
    }
  }).catch(() => {});
}

async function demoPause(page: Page) {
  const pauseMs = Number(process.env.E2E_DEMO_PAUSE_MS ?? 0) || 0;
  if (pauseMs > 0) {
    await page.waitForTimeout(pauseMs);
  }
}

async function uploadEvidence(request: APIRequestContext) {
  const filePath = path.join(process.cwd(), "e2e", "fixtures", "evidence.png");
  const uploaded = await apiUpload<UploadedImage>(request, "/api/upload/images", filePath);
  return uploaded.id;
}

async function apiUpload<T>(request: APIRequestContext, url: string, filePath: string) {
  const response = await request.post(url, {
    multipart: {
      file: {
        name: "e2e-evidence.png",
        mimeType: "image/png",
        buffer: await import("node:fs/promises").then((fs) => fs.readFile(filePath)),
      },
    },
  });
  const json = (await response.json()) as { success: boolean; data: T; error?: { message?: string } };
  if (!response.ok() || !json.success) {
    throw new Error(`${url} failed with ${response.status()}: ${json.error?.message ?? ""}`);
  }
  return json.data;
}
