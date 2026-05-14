import { http, HttpResponse } from "msw";
import type { AnalyticsOverview } from "@/shared/types";

const BASE = "http://localhost:3000/api";

export const MOCK_ANALYTICS: AnalyticsOverview = {
  totalAudits: 42,
  avgScore: 78.5,
  passRate: 0.83,
  failCount: 7,
  recentAudits: [
    {
      id: "audit-1",
      storeId: "store-1",
      store: { id: "store-1", name: "MayCha Q1", code: "MC-Q1" },
      finalScore: 85.5,
      grade: "good",
      submittedAt: new Date().toISOString(),
    },
  ],
};

export const analyticsHandlers = [
  http.get(`${BASE}/analytics/overview`, () =>
    HttpResponse.json({ success: true, data: MOCK_ANALYTICS })
  ),
];
