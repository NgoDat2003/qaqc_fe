import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { apiGet } from "../../helpers/api";
import { evidenceFixtures } from "../../helpers/test-data";
import type { HumanDriver } from "../../portfolio-driver";
import type { CreatedPlanContext } from "../qam/audit-plan-actions";

interface MyAssignment {
  id: string;
  auditId: string | null;
  plan: { id: string; name: string };
}

interface CriteriaRef {
  id: string;
  code: string;
  flag: "none" | "critical" | "risk";
}

interface AuditSession {
  checklist: {
    sections: Array<{
      items?: Array<{
        criteria?: CriteriaRef;
      }>;
    }>;
  };
  audit: {
    violations: Array<{
      criteriaId: string;
      numErrors: number;
      note: string | null;
      images: Array<{ id: string }>;
    }>;
  } | null;
}

interface SubmitAuditResponse {
  id: string;
}

export interface SubmittedAuditContext extends CreatedPlanContext {
  auditId: string;
}

export async function completeAuditByUi(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  plan: CreatedPlanContext,
): Promise<SubmittedAuditContext> {
  const assignment = await findAssignment(request, plan);
  await page.goto("/qc/my-assignments", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Việc của tôi|Viec cua toi|Công việc QC|Cong viec QC/i }).first())
    .toBeVisible({ timeout: 20_000 });
  await driver.pause("qc-assignment-list");

  await page.goto(`/qc/audits/${assignment.id}`, { waitUntil: "domcontentloaded" });
  const session = await apiGet<AuditSession>(request, `/api/audits/assignments/${assignment.id}`);
  const regular = findCriteria(session, "none");
  const ccp = findCriteria(session, "critical");
  if (!regular || !ccp) throw new Error("Golden flow requires one regular criterion and one CCP criterion.");

  await fillCriterion(page, request, driver, assignment.id, regular, "E2E normal issue for portfolio demo");
  await driver.click(page.getByTestId("section-tab-virtual-ccp"));
  await fillCriterion(page, request, driver, assignment.id, ccp, "E2E CCP issue for portfolio demo", evidenceFixtures.audit);
  await expect(page.getByTestId("draft-status-saved")).toBeVisible({ timeout: 20_000 });
  await driver.pause("qc-audit-filled");

  const submitResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/audits/submit") &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("submit-audit-button"));
  await driver.click(page.getByTestId("confirm-submit-audit-button"));
  const submitResponse = await submitResponsePromise;
  if (!submitResponse.ok()) {
    throw new Error(`/api/audits/submit failed with ${submitResponse.status()}: ${await submitResponse.text()}`);
  }
  const submitted = await unwrapSubmitResponse(submitResponse);
  await driver.pause("qc-audit-submitted");
  return { ...plan, assignmentId: assignment.id, auditId: submitted.id };
}

async function findAssignment(request: APIRequestContext, plan: CreatedPlanContext) {
  const assignments = await apiGet<MyAssignment[]>(request, "/api/audit-plans/my-assignments");
  const assignment = assignments.find((item) => item.id === plan.assignmentId || item.plan.id === plan.planId);
  if (!assignment) throw new Error(`QC assignment not found for plan ${plan.planName}.`);
  return assignment;
}

function findCriteria(session: AuditSession, flag: CriteriaRef["flag"]) {
  return session.checklist.sections
    .flatMap((section) => section.items ?? [])
    .map((item) => item.criteria)
    .find((criteria): criteria is CriteriaRef => criteria?.flag === flag);
}

async function fillCriterion(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  assignmentId: string,
  criteria: CriteriaRef,
  note: string,
  evidencePath?: string,
) {
  await expect(page.getByTestId(`criteria-card-${criteria.id}`)).toBeVisible({ timeout: 15_000 });
  await driver.click(page.getByTestId(`criteria-increment-${criteria.id}`));
  await driver.type(page.getByTestId(`criteria-note-${criteria.id}`), note, { clear: true });
  if (evidencePath) {
    const uploadResponse = page.waitForResponse(
      (response) => response.url().includes("/api/upload/images") &&
        response.request().method() === "POST" &&
        response.status() < 400,
      { timeout: 30_000 },
    );
    await page.getByTestId(`audit-evidence-gallery-input-${criteria.id}`).setInputFiles(evidencePath);
    await uploadResponse;
  }
  await waitCriterionSaved(request, assignmentId, criteria.id, note, evidencePath ? 1 : 0);
}

async function waitCriterionSaved(
  request: APIRequestContext,
  assignmentId: string,
  criteriaId: string,
  note: string,
  minImages: number,
) {
  await expect.poll(async () => {
    const session = await apiGet<AuditSession>(request, `/api/audits/assignments/${assignmentId}`);
    const violation = session.audit?.violations.find((item) => item.criteriaId === criteriaId);
    return {
      errors: violation?.numErrors ?? 0,
      note: violation?.note ?? "",
      imageCount: violation?.images.length ?? 0,
    };
  }, { timeout: 45_000 }).toEqual({
    errors: 1,
    note,
    imageCount: minImages,
  });
}

async function unwrapSubmitResponse(response: { json(): Promise<unknown> }) {
  const json = await response.json() as {
    success?: boolean;
    data?: SubmitAuditResponse;
    error?: { message?: string } | string;
  };
  if (!json.success || !json.data?.id) {
    const message = typeof json.error === "string" ? json.error : json.error?.message ?? "Unexpected submit response";
    throw new Error(message);
  }
  return json.data;
}
