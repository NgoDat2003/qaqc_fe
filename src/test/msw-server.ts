import { setupServer } from "msw/node";
import { authHandlers } from "./handlers/auth.handlers";
import { auditHandlers } from "./handlers/audit.handlers";
import { actionPlanHandlers } from "./handlers/action-plan.handlers";
import { analyticsHandlers } from "./handlers/analytics.handlers";

export const server = setupServer(
  ...authHandlers,
  ...auditHandlers,
  ...actionPlanHandlers,
  ...analyticsHandlers,
);
