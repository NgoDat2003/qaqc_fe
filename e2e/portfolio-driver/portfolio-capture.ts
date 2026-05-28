import type { Page, TestInfo } from "@playwright/test";

export async function capturePortfolioCheckpoint(page: Page, testInfo: TestInfo, name: string) {
  if (process.env.E2E_PORTFOLIO_CAPTURE !== "true") return;
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
  });
}
