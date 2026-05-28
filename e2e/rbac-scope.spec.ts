import { test, expect } from "@playwright/test";
import { apiGet } from "./helpers/api";
import { loginAs, logout } from "./helpers/auth";
import { forbiddenPattern } from "./helpers/selectors";

interface ActionPlanSummary {
  id: string;
}

test.describe("RBAC scope smoke", () => {
  test.setTimeout(90_000);

  test("role landing pages render scoped dashboard", async ({ page }) => {
    for (const role of ["admin", "qam", "qc", "sm", "am"] as const) {
      await loginAs(page, role);
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole("heading").first()).toBeVisible();
      await logout(page);
    }
  });

  test("SM cannot open an arbitrary action plan outside scope", async ({ page }) => {
    await loginAs(page, "sm");
    const smVisibleActionPlans = await apiGet<ActionPlanSummary[]>(page.request, "/api/action-plans");
    const smVisibleIds = new Set(smVisibleActionPlans.map((actionPlan) => actionPlan.id));
    await logout(page);

    await loginAs(page, "qam");
    const actionPlans = await apiGet<ActionPlanSummary[]>(page.request, "/api/action-plans");
    const target = actionPlans.find((actionPlan) => !smVisibleIds.has(actionPlan.id));
    test.skip(!target, "No out-of-scope action plan available for RBAC smoke.");
    if (!target) return;

    await logout(page);
    await loginAs(page, "sm");
    await page.goto(`/action-plans/${target.id}`);
    await expect(page.getByText(forbiddenPattern).first()).toBeVisible({ timeout: 15000 });
  });
});
