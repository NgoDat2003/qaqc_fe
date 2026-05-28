import type { APIRequestContext } from "@playwright/test";
import { apiGet } from "../helpers/api";
import {
  assertPortfolioPlanNameAvailable,
  validatePortfolioEvidenceFixtures,
} from "../helpers/preflight";
import { goldenSeedDefaults, roleAccounts } from "../helpers/test-data";

export interface GoldenFlowSeed {
  storeId: string;
  storeCode: string;
  storeName: string;
  checklistId: string;
  checklistName: string;
  checklistVersion: string;
  qcEmail: string;
  smEmail: string;
}

interface PortfolioPreflightInput {
  planName: string;
  seed: GoldenFlowSeed;
}

export function getGoldenFlowSeed(): GoldenFlowSeed {
  return {
    storeId: process.env.E2E_GOLDEN_STORE_ID ?? goldenSeedDefaults.storeId,
    storeCode: process.env.E2E_GOLDEN_STORE_CODE ?? goldenSeedDefaults.storeCode,
    storeName: process.env.E2E_GOLDEN_STORE_NAME ?? goldenSeedDefaults.storeName,
    checklistId: process.env.E2E_GOLDEN_CHECKLIST_ID ?? goldenSeedDefaults.checklistId,
    checklistName: process.env.E2E_GOLDEN_CHECKLIST_NAME ?? goldenSeedDefaults.checklistName,
    checklistVersion: process.env.E2E_GOLDEN_CHECKLIST_VERSION ?? goldenSeedDefaults.checklistVersion,
    qcEmail: process.env.E2E_GOLDEN_QC_EMAIL ?? roleAccounts.qc.email,
    smEmail: process.env.E2E_GOLDEN_SM_EMAIL ?? roleAccounts.sm.email,
  };
}

export async function assertPortfolioPreflight(
  request: APIRequestContext,
  input: PortfolioPreflightInput,
) {
  assertMutationEnvironment();
  assertSeedLooksComplete(input.seed);
  await validatePortfolioEvidenceFixtures();
  await assertPortfolioPlanNameAvailable(request, input.planName);
  await apiGet<unknown>(request, "/api/auth/me").catch(() => undefined);
}

export function assertMutationEnvironment() {
  if (process.env.E2E_ALLOW_MUTATION !== "true") {
    throw new Error("Set E2E_ALLOW_MUTATION=true only on a disposable/local E2E database.");
  }
}

function assertSeedLooksComplete(seed: GoldenFlowSeed) {
  if (!seed.storeId.trim()) {
    throw new Error("Golden seed storeId is required for the portfolio golden flow.");
  }
  if (!seed.storeCode.trim()) {
    throw new Error("Golden seed storeCode is required for the portfolio golden flow.");
  }
  if (!seed.checklistId.trim()) {
    throw new Error("Golden seed checklistId is required for the portfolio golden flow.");
  }
  if (!seed.qcEmail.includes("@")) {
    throw new Error(`Invalid QC email for golden flow: ${seed.qcEmail}`);
  }
  if (!seed.smEmail.includes("@")) {
    throw new Error(`Invalid SM email for golden flow: ${seed.smEmail}`);
  }
}
