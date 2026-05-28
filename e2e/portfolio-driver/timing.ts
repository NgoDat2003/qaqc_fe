export interface PortfolioTiming {
  clickPauseMs: number;
  mouseSteps: number;
  typingDelayMs: number;
  scenePauseMs: number;
}

export function getPortfolioTiming(): PortfolioTiming {
  return {
    clickPauseMs: numberEnv("E2E_CLICK_PAUSE_MS", 120),
    mouseSteps: numberEnv("E2E_MOUSE_STEPS", 18),
    typingDelayMs: numberEnv("E2E_TYPING_DELAY_MS", 35),
    scenePauseMs: numberEnv("E2E_DEMO_PAUSE_MS", 1000),
  };
}

function numberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
