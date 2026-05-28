import { test } from "@playwright/test";
import { loginByForm } from "../page-actions/auth/login-actions";
import { closeActionPlanByUi } from "../page-actions/qam/action-plan-review-actions";
import { createAndAssignPlanByUi } from "../page-actions/qam/audit-plan-actions";
import { createActionPlanFromAuditByUi } from "../page-actions/qam/audit-result-actions";
import { completeAuditByUi } from "../page-actions/qc/audit-execution-actions";
import { submitRemediationByUi } from "../page-actions/sm/remediation-actions";
import { createHumanDriver } from "../portfolio-driver";
import { assertPortfolioPreflight, getGoldenFlowSeed } from "../support/golden-flow-seed";
import { makePortfolioPlanName } from "../helpers/test-data";

test.describe("Portfolio golden flow - full UI", () => {
  test.setTimeout(480_000);
  test.skip(process.env.E2E_ALLOW_MUTATION !== "true", "Enable only after BE cleanup/seed gate.");

  test("QAM -> QC -> QAM -> SM -> QAM closes AP", async ({ page }, testInfo) => {
    const driver = await createHumanDriver(page, testInfo);
    const seed = getGoldenFlowSeed();
    const planName = makePortfolioPlanName();

    let planContext: Awaited<ReturnType<typeof createAndAssignPlanByUi>> | undefined;
    let auditContext: Awaited<ReturnType<typeof completeAuditByUi>> | undefined;
    let actionPlanContext: Awaited<ReturnType<typeof createActionPlanFromAuditByUi>> | undefined;

    await test.step("QAM creates and assigns audit plan", async () => {
      await loginByForm(page, driver, "qam");
      await assertPortfolioPreflight(page.request, { planName, seed });
      planContext = await createAndAssignPlanByUi(page, page.request, driver, { planName, seed });
      await driver.capture("01-qam-plan-assigned");
    });

    await test.step("QC submits normal + CCP audit", async () => {
      await loginByForm(page, driver, "qc");
      auditContext = await completeAuditByUi(page, page.request, driver, requireContext(planContext, "plan"));
      await driver.capture("02-qc-audit-submitted");
    });

    await test.step("QAM creates action plan", async () => {
      await loginByForm(page, driver, "qam");
      actionPlanContext = await createActionPlanFromAuditByUi(page, page.request, driver, requireContext(auditContext, "audit"));
      await driver.capture("03-qam-action-plan-created");
    });

    await test.step("SM remediates and submits AP", async () => {
      await loginByForm(page, driver, "sm");
      await submitRemediationByUi(page, page.request, driver, requireContext(actionPlanContext, "action plan"));
      await driver.capture("04-sm-ap-submitted");
    });

    await test.step("QAM closes AP", async () => {
      await loginByForm(page, driver, "qam");
      await closeActionPlanByUi(page, page.request, driver, requireContext(actionPlanContext, "action plan"));
      await driver.capture("05-qam-ap-closed");
    });
  });
});

function requireContext<T>(value: T | undefined, label: string): T {
  if (!value) throw new Error(`Missing ${label} context from previous portfolio step.`);
  return value;
}
