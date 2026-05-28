export type E2ERole = "admin" | "qam" | "qc" | "sm" | "am";

export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "Test@1234";
export const E2E_PORTFOLIO_PREFIX = "E2E Portfolio";

export const roleAccounts = {
  admin: { email: "admin@qualityops.com", password: E2E_PASSWORD },
  qam: { email: "ngoclam.le3@gmail.com", password: E2E_PASSWORD },
  qc: { email: "gianguyen.7kang28@gmail.com", password: E2E_PASSWORD },
  sm: { email: process.env.E2E_SM_EMAIL ?? "store-manager-152@qualityops.demo", password: E2E_PASSWORD },
  am: { email: process.env.E2E_AM_EMAIL ?? "thanh7ke55@yahoo.com", password: E2E_PASSWORD },
} satisfies Record<E2ERole, { email: string; password: string }>;

export const goldenSeedDefaults = {
  storeId: "cmpewvhat011rwdgnmoh5qsfd",
  storeCode: "CH0001",
  storeName: "Bep Trung Tam Ngo Quyen",
  checklistId: "cmpccz5ax0025p3fyqqlf1bhj",
  checklistName: "Checklist van hanh cua hang - Demo",
  checklistVersion: "6.0.0",
} as const;

export function makeRunId() {
  const timestamp = new Date().toISOString().replace(/\D/g, "");
  return `${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
}

export function makeE2EName(label: string, runId: string) {
  return `E2E ${label} ${runId}`;
}

export function makePortfolioRunId() {
  const fromEnv = process.env.E2E_PORTFOLIO_RUN_ID?.trim();
  if (fromEnv) return fromEnv;
  return new Date().toISOString().replace(/\D/g, "").slice(0, 12);
}

export function makePortfolioPlanName(runId = makePortfolioRunId()) {
  return `${E2E_PORTFOLIO_PREFIX} ${runId}`;
}

export function assertPortfolioRunId(runId: string) {
  if (!/^\d{12}$/.test(runId)) {
    throw new Error(
      `E2E_PORTFOLIO_RUN_ID must be 12 digits until BE confirms a different cleanup rule. Received: ${runId}`,
    );
  }
}

export const evidenceFixtures = {
  audit: "e2e/fixtures/audit-evidence.jpg",
  remediation: "e2e/fixtures/remediation-evidence.jpg",
} as const;
