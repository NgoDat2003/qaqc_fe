import { setupServer } from "msw/node";
import { authHandlers } from "./handlers/auth.handlers";
import { auditHandlers } from "./handlers/audit.handlers";

export const server = setupServer(...authHandlers, ...auditHandlers);
