import { expect, type Locator, type Page } from "@playwright/test";
import type { HumanDriver } from "../portfolio-driver";

export async function selectComboboxByOptionTestId(
  driver: HumanDriver,
  trigger: Locator,
  optionTestId: string,
) {
  await driver.click(trigger);
  await driver.click(driver.page.getByTestId(optionTestId));
}

export async function waitForPageReady(page: Page) {
  await expect(page.locator("body")).toBeVisible();
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
}
