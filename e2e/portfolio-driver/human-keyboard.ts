import type { Locator } from "@playwright/test";
import type { PortfolioTiming } from "./timing";

export async function humanType(
  locator: Locator,
  text: string,
  timing: PortfolioTiming,
  options: { clear?: boolean } = {},
) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  if (options.clear) await locator.fill("");
  await locator.pressSequentially(text, { delay: timing.typingDelayMs });
}
