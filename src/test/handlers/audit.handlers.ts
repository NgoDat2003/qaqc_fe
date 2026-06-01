import { http, HttpResponse } from "msw";
import { TEST_API_BASE_URL } from "../api-base";

const BASE = TEST_API_BASE_URL;

export const MOCK_ASSIGNMENT_ID = "asgn-001";

const mockChecklist = {
  id: "form-001",
  name: "Tiêu chuẩn CHEP",
  version: "1.0",
  status: "published",
  publishedAt: "2026-01-01T00:00:00Z",
  sections: [
    {
      id: "sec-c",
      groupId: "grp-c",
      group: { id: "grp-c", name: "Vệ sinh", code: "C", color: null },
      name: "Vệ sinh",
      order: 1,
      weight: 30,
      items: [
        {
          id: "item-001",
          sectionId: "sec-c",
          criteriaId: "crit-001",
          order: 1,
          criteria: {
            id: "crit-001",
            code: "C01",
            groupId: "grp-c",
            content: "Sàn nhà sạch, không có rác",
            deductionPerError: 5,
            maxDeduction: 20,
            flag: "none",
            isActive: true,
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
        },
      ],
    },
  ],
};

const mockSession = {
  assignment: {
    id: MOCK_ASSIGNMENT_ID,
    status: "pending",
    store: { id: "store-001", code: "MC001", name: "MayCha Quận 1" },
    plan: {
      id: "plan-001",
      name: "Kiểm tra tháng 5",
      status: "open",
      startDate: "2026-05-01",
      endDate: "2026-05-31",
      isAuditWindowOpen: true,
    },
  },
  checklist: mockChecklist,
  audit: null,
};

export const auditHandlers = [
  // QC my-assignments list
  http.get(`${BASE}/audit-plans/my-assignments`, () =>
    HttpResponse.json({
      success: true,
      data: [
        {
          id: MOCK_ASSIGNMENT_ID,
          status: "pending",
          store: { id: "store-001", code: "MC001", name: "MayCha Quận 1" },
          plan: {
            id: "plan-001",
            name: "Kiểm tra tháng 5",
            status: "open",
            startDate: "2026-05-01",
            endDate: "2026-05-31",
            isAuditWindowOpen: true,
          },
          checklist: { id: "form-001", name: "Tiêu chuẩn CHEP", version: "1.0" },
          auditId: null,
        },
      ],
    })
  ),

  // Open audit session
  http.get(`${BASE}/audits/assignments/:assignmentId`, () =>
    HttpResponse.json({ success: true, data: mockSession })
  ),

  // History bundle
  http.get(`${BASE}/audits/assignments/:assignmentId/history`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: {
        assignmentId: params.assignmentId,
        store: { id: "store-001", code: "MC001", name: "MayCha Quận 1" },
        historiesByCriteriaId: {},
      },
    })
  ),

  // Save draft
  http.patch(`${BASE}/audits/draft`, () =>
    HttpResponse.json({ success: true, data: null })
  ),

  // Submit audit
  http.post(`${BASE}/audits/submit`, () =>
    HttpResponse.json({
      success: true,
      data: {
        id: "audit-001",
        finalScore: 85.0,
        grade: "good",
        isRiskTriggered: false,
        repeatInfo: [],
      },
    })
  ),
];
