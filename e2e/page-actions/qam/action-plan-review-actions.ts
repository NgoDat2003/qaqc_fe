import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { apiGet } from "../../helpers/api";
import type { HumanDriver } from "../../portfolio-driver";
import type { ActionPlanContext } from "./audit-result-actions";

interface ActionPlanDetail {
  id: string;
  status: "draft" | "submitted" | "rejected" | "closed";
}

export async function closeActionPlanByUi(
  page: Page,
  request: APIRequestContext,
  driver: HumanDriver,
  context: ActionPlanContext,
) {
  await page.goto(`/action-plans/${context.actionPlanId}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/action-plans/${context.actionPlanId}`));
  await expect.poll(
    async () => (await apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`)).status,
    { timeout: 30_000 },
  ).toBe("submitted");
  await driver.pause("qam-review-submitted-ap");

  const closeResponse = page.waitForResponse(
    (response) => response.url().includes(`/api/action-plans/${context.actionPlanId}/close`) &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await driver.click(page.getByTestId("action-plan-close-button"));
  const response = await closeResponse;
  if (!response.ok()) {
    throw new Error(`Close action plan failed with ${response.status()}: ${await response.text()}`);
  }
  await expect.poll(
    async () => (await apiGet<ActionPlanDetail>(request, `/api/action-plans/${context.actionPlanId}`)).status,
    { timeout: 30_000 },
  ).toBe("closed");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText(/closed|đã đóng|da dong/i).first()).toBeVisible({ timeout: 20_000 });
}
