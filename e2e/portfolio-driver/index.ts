import type { Locator, Page, TestInfo } from "@playwright/test";
import { installCursorOverlay } from "./cursor-overlay";
import { humanType } from "./human-keyboard";
import { humanClick } from "./human-pointer";
import { capturePortfolioCheckpoint } from "./portfolio-capture";
import { getPortfolioTiming } from "./timing";

export interface HumanDriver {
  page: Page;
  click(locator: Locator): Promise<void>;
  type(locator: Locator, text: string, options?: { clear?: boolean }): Promise<void>;
  selectByText(trigger: Locator, optionName: string | RegExp): Promise<void>;
  upload(input: Locator, filePath: string): Promise<void>;
  pause(label: string, ms?: number): Promise<void>;
  capture(name: string): Promise<void>;
}

export async function createHumanDriver(page: Page, testInfo: TestInfo): Promise<HumanDriver> {
  const timing = getPortfolioTiming();
  await installCursorOverlay(page);

  return {
    page,
    click: (locator) => humanClick(page, locator, timing),
    type: (locator, text, options) => humanType(locator, text, timing, options),
    async selectByText(trigger, optionName) {
      await humanClick(page, trigger, timing);
      const option = page.getByRole("option", { name: optionName }).or(page.getByText(optionName).first());
      await humanClick(page, option, timing);
    },
    async upload(input, filePath) {
      await input.setInputFiles(filePath);
    },
    async pause(_label, ms) {
      const pauseMs = ms ?? timing.scenePauseMs;
      if (pauseMs > 0) await page.waitForTimeout(pauseMs);
    },
    capture: (name) => capturePortfolioCheckpoint(page, testInfo, name),
  };
}
