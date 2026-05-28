import type { Page } from "@playwright/test";

const CURSOR_ID = "e2e-portfolio-cursor";

export async function installCursorOverlay(page: Page) {
  if (process.env.E2E_PORTFOLIO_CAPTURE !== "true") return;
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal{display:none!important;pointer-events:none!important;}";
    document.documentElement.appendChild(style);
  });
  await page.addStyleTag({
    content: `
      nextjs-portal {
        display: none !important;
        pointer-events: none !important;
      }
      #${CURSOR_ID} {
        position: fixed;
        left: 0;
        top: 0;
        width: 18px;
        height: 18px;
        border: 2px solid #0f9a9a;
        border-radius: 999px;
        box-shadow: 0 0 0 4px rgba(15, 154, 154, 0.14);
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        transition: width 120ms ease, height 120ms ease, box-shadow 120ms ease;
      }
      #${CURSOR_ID}[data-clicking="true"] {
        width: 28px;
        height: 28px;
        box-shadow: 0 0 0 8px rgba(15, 154, 154, 0.18);
      }
    `,
  });
  await page.evaluate((cursorId) => {
    if (document.getElementById(cursorId)) return;
    const node = document.createElement("div");
    node.id = cursorId;
    node.setAttribute("data-e2e-overlay", "true");
    document.body.appendChild(node);
  }, CURSOR_ID);
}

export async function disableNextDevToolsOverlay(page: Page) {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll("nextjs-portal")) {
      const element = node as HTMLElement;
      element.style.display = "none";
      element.style.pointerEvents = "none";
    }
  });
}

export async function moveOverlay(page: Page, x: number, y: number) {
  if (process.env.E2E_PORTFOLIO_CAPTURE !== "true") return;
  await page.evaluate(
    ({ cursorId, xValue, yValue }) => {
      const node = document.getElementById(cursorId);
      if (!node) return;
      node.style.left = `${xValue}px`;
      node.style.top = `${yValue}px`;
    },
    { cursorId: CURSOR_ID, xValue: x, yValue: y },
  );
}

export async function pulseOverlay(page: Page) {
  if (process.env.E2E_PORTFOLIO_CAPTURE !== "true") return;
  await page.evaluate((cursorId) => {
    const node = document.getElementById(cursorId);
    if (node) node.setAttribute("data-clicking", "true");
  }, CURSOR_ID);
  await page.waitForTimeout(120);
  await page.evaluate((cursorId) => {
    const node = document.getElementById(cursorId);
    if (node) node.removeAttribute("data-clicking");
  }, CURSOR_ID);
}
