import type { Locator, Page } from "@playwright/test";
import type { PortfolioTiming } from "./timing";
import { disableNextDevToolsOverlay, moveOverlay, pulseOverlay } from "./cursor-overlay";

export async function moveToLocator(page: Page, locator: Locator, timing: PortfolioTiming) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error("Cannot move to invisible locator.");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: timing.mouseSteps });
  await moveOverlay(page, x, y);
}

export async function humanClick(page: Page, locator: Locator, timing: PortfolioTiming) {
  await disableNextDevToolsOverlay(page);
  await moveToLocator(page, locator, timing);
  if (timing.clickPauseMs > 0) await page.waitForTimeout(timing.clickPauseMs);
  await pulseOverlay(page);
  try {
    await locator.click({ timeout: 5_000 });
  } catch (error) {
    if (String(error).includes("nextjs-portal")) {
      await locator.click({ force: true });
      return;
    }
    throw error;
  }
}
