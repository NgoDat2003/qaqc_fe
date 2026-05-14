import { http, HttpResponse } from "msw";
import type { ActionPlan } from "@/shared/types";

const BASE = "http://localhost:3000/api";

export const MOCK_ACTION_PLAN: ActionPlan = {
  id: "ap-1",
  auditId: "audit-1",
  storeId: "store-1",
  store: { id: "store-1", name: "MayCha Q1", code: "MC-Q1" },
  status: "draft",
  remediation: null,
  deadline: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  closedAt: null,
  closedById: null,
};

export const actionPlanHandlers = [
  http.get(`${BASE}/action-plans`, () =>
    HttpResponse.json({ success: true, data: [MOCK_ACTION_PLAN] })
  ),

  http.get(`${BASE}/action-plans/:id`, ({ params }) => {
    if (params.id === "not-found") {
      return HttpResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: MOCK_ACTION_PLAN });
  }),

  http.patch(`${BASE}/action-plans/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { ...MOCK_ACTION_PLAN, ...body },
    });
  }),

  http.post(`${BASE}/action-plans/:id/submit`, () =>
    HttpResponse.json({
      success: true,
      data: { ...MOCK_ACTION_PLAN, status: "submitted" },
    })
  ),

  http.post(`${BASE}/action-plans/:id/confirm`, async ({ request }) => {
    const body = await request.json() as { action: "confirm" | "reject" };
    const status = body.action === "reject" ? "rejected" : "submitted";
    return HttpResponse.json({
      success: true,
      data: { ...MOCK_ACTION_PLAN, status },
    });
  }),

  http.post(`${BASE}/action-plans/:id/close`, () =>
    HttpResponse.json({
      success: true,
      data: { ...MOCK_ACTION_PLAN, status: "closed", closedAt: new Date().toISOString() },
    })
  ),
];
