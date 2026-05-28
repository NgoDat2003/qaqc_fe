import { expect, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { loginAs, logout } from "./auth";
import { apiGet } from "./api";
import { withRolePage } from "./session";
import { assertPortfolioRunId, evidenceFixtures, roleAccounts, type E2ERole } from "./test-data";

interface UserRef {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

interface StoreRef {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  manager?: { id: string; email: string; fullName: string } | null;
  am?: { id: string; email: string; fullName: string } | null;
}

interface ChecklistSummaryRef {
  id: string;
  name: string;
  version: string;
  status: string;
}

interface CriteriaRef {
  id: string;
  code: string;
  flag: "none" | "critical" | "risk";
}

interface ChecklistDetailRef extends ChecklistSummaryRef {
  sections: Array<{
    items?: Array<{
      criteriaId: string;
      criteria?: CriteriaRef;
    }>;
  }>;
}

interface AuditPlanListRef {
  name: string;
}

export interface SuitableSeed {
  checklist: ChecklistDetailRef;
  store: StoreRef;
  qc: UserRef;
  smEmail: string;
  amEmail?: string;
}

export function assertMutationEnvironment() {
  if (process.env.E2E_ALLOW_MUTATION !== "true") {
    throw new Error("Mutation E2E requires a disposable test database and E2E_ALLOW_MUTATION=true.");
  }
}

export async function verifyRoleLogins(page: Page) {
  const roles: E2ERole[] = ["admin", "qam", "qc", "sm", "am"];
  for (const role of roles) {
    await loginAs(page, role);
    await expect(page).toHaveURL(/\/dashboard/);
    await logout(page);
  }
}

export async function verifyRoleLoginsIsolated(browser: Browser) {
  const roles: E2ERole[] = ["admin", "qam", "qc", "sm", "am"];
  for (const role of roles) {
    await withRolePage(browser, role, async (page) => {
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }
}

export async function validateEvidenceFixture(fixturePath: string) {
  const bytes = await readFile(fixturePath);
  if (bytes.length < 32 || bytes.length > 5 * 1024 * 1024) {
    throw new Error(`Invalid evidence fixture size: ${bytes.length}`);
  }

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isWebp =
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    throw new Error("Evidence fixture must be PNG, JPEG, or WEBP.");
  }
}

export async function validateJpegEvidenceFixture(fixturePath: string) {
  const bytes = await readFile(fixturePath);
  const isJpeg = bytes.length >= 32 && bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!isJpeg) {
    throw new Error(`${fixturePath} must be a real JPEG fixture for portfolio recording.`);
  }
  if (bytes.length > 5 * 1024 * 1024) {
    throw new Error(`${fixturePath} exceeds 5MB.`);
  }
}

export async function validatePortfolioEvidenceFixtures() {
  await validateJpegEvidenceFixture(evidenceFixtures.audit);
  await validateJpegEvidenceFixture(evidenceFixtures.remediation);
}

export async function assertPortfolioPlanNameAvailable(request: APIRequestContext, planName: string) {
  const runId = planName.replace(/^E2E Portfolio\s+/, "");
  assertPortfolioRunId(runId);
  const plans = await apiGet<AuditPlanListRef[]>(request, "/api/audit-plans");
  const exists = plans.some((plan) => plan.name.trim() === planName.trim());
  if (exists) {
    throw new Error(
      `Portfolio plan already exists: ${planName}. Run BE cleanup first or set E2E_PORTFOLIO_RUN_ID to a new 12-digit value.`,
    );
  }
}

export async function resolveSuitableSeed(request: APIRequestContext): Promise<SuitableSeed> {
  const stores = await apiGet<StoreRef[]>(request, "/api/stores");
  const qcs = await apiGet<UserRef[]>(request, "/api/users?role=qc_auditor");
  const checklists = await apiGet<ChecklistSummaryRef[]>(request, "/api/checklists?status=published");

  const store = stores.find(
    (candidate) =>
      candidate.isActive &&
      candidate.manager?.email?.toLowerCase() === roleAccounts.sm.email.toLowerCase(),
  );
  if (!store) {
    throw new Error(`No active store found for SM account ${roleAccounts.sm.email}.`);
  }

  const qc = qcs.find(
    (user) =>
      user.isActive &&
      user.email.toLowerCase() === roleAccounts.qc.email.toLowerCase(),
  );
  if (!qc) {
    throw new Error(`No active QC auditor found for E2E account ${roleAccounts.qc.email}.`);
  }

  const details = await Promise.all(
    checklists.map((checklist) =>
      apiGet<ChecklistDetailRef>(request, `/api/checklists/${checklist.id}`),
    ),
  );
  const checklist = details.find((detail) => {
    const criteria = detail.sections.flatMap((section) => section.items ?? []).map((item) => item.criteria);
    return criteria.some((item) => item?.flag === "none") &&
      criteria.some((item) => item?.flag === "risk" || item?.flag === "critical");
  });
  if (!checklist) {
    throw new Error("No published checklist has both regular and Risk/CCP criteria for E2E.");
  }

  return {
    checklist,
    store,
    qc,
    smEmail: roleAccounts.sm.email,
    amEmail: store.am?.email,
  };
}

export function getFirstRegularCriteria(checklist: ChecklistDetailRef) {
  return checklist.sections
    .flatMap((section) => section.items ?? [])
    .map((item) => item.criteria)
    .find((criteria): criteria is CriteriaRef => criteria?.flag === "none");
}
