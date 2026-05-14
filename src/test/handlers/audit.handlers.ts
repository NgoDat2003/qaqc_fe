import { http, HttpResponse } from "msw";
import type { SubmitAuditResponse, AuditAssignment, ChecklistForm } from "@/shared/types";

const BASE = "http://localhost:3000/api";

export const MOCK_SUBMIT_RESULT: SubmitAuditResponse = {
  id: "audit-1",
  finalScore: 85.5,
  grade: "good",
  isRiskTriggered: false,
  repeatInfo: [
    {
      criteriaId: "crit-1",
      numErrors: 2,
      repeatCount: 1,
      repeatLabel: "first",
      isCriticalTriggered: false,
    },
  ],
};

export const MOCK_ASSIGNMENT: AuditAssignment = {
  id: "assign-1",
  planId: "plan-1",
  storeId: "store-1",
  store: { id: "store-1", name: "MayCha Q1", code: "MC-Q1", address: "123 Nguyen Hue" },
  auditorId: "user-2",
  scheduledDate: new Date().toISOString(),
  status: "pending",
  auditId: null,
};

export const MOCK_CHECKLIST: ChecklistForm = {
  id: "form-1",
  name: "Checklist v1",
  version: "1.0",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "sec-1",
      formId: "form-1",
      groupId: "grp-1",
      group: { id: "grp-1", name: "Cleanliness", code: "C", weight: 0.3 },
      name: "Cleanliness",
      order: 1,
      items: [
        {
          id: "item-1",
          sectionId: "sec-1",
          criteriaId: "crit-1",
          criteria: {
            id: "crit-1",
            code: "C01",
            groupId: "grp-1",
            content: "Sàn nhà sạch",
            deductionPerError: 5,
            maxDeduction: 15,
            flag: "none",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          order: 1,
        },
      ],
    },
  ],
};

export const auditHandlers = [
  http.post(`${BASE}/audits/submit`, async ({ request }) => {
    const body = await request.json() as { assignmentId: string };
    if (body.assignmentId === "completed-assign") {
      return HttpResponse.json(
        { success: false, error: "Assignment already completed" },
        { status: 400 }
      );
    }
    return HttpResponse.json({ success: true, data: MOCK_SUBMIT_RESULT });
  }),

  http.get(`${BASE}/audit-plans/my-assignments`, () =>
    HttpResponse.json({ success: true, data: [MOCK_ASSIGNMENT] })
  ),

  http.get(`${BASE}/audits/:id/checklist`, () =>
    HttpResponse.json({ success: true, data: MOCK_CHECKLIST })
  ),

  http.get(`${BASE}/audits`, () =>
    HttpResponse.json({ success: true, data: [] })
  ),

  http.get(`${BASE}/audits/:id`, () =>
    HttpResponse.json({ success: true, data: { id: "audit-1", finalScore: 85.5, grade: "good" } })
  ),
];
