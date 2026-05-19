# Phase 6 — Tests

**Effort:** 30m | **Depends on:** Phase 1–5

## Overview

MSW handlers cho audit execution endpoints + unit tests cho hooks.
Triết lý: test behavior, không test implementation.

## Files tạo mới / sửa đổi

### `src/test/handlers/audit.handlers.ts` *(file mới)*

```ts
import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000/api";

// Mock data
const MOCK_ASSIGNMENT_ID = "asgn-001";
const MOCK_CHECKLIST_SECTION = {
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
};

const MOCK_SESSION = {
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
  checklist: {
    id: "form-001",
    name: "Tiêu chuẩn CHEP",
    version: "1.0",
    status: "published",
    publishedAt: "2026-01-01T00:00:00Z",
    sections: [MOCK_CHECKLIST_SECTION],
  },
  audit: null,
};

export const auditHandlers = [
  // GET my-assignments
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

  // GET audit session
  http.get(`${BASE}/audits/assignments/:assignmentId`, () =>
    HttpResponse.json({ success: true, data: MOCK_SESSION })
  ),

  // GET audit history
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

  // PATCH draft
  http.patch(`${BASE}/audits/draft`, () =>
    HttpResponse.json({ success: true, data: null })
  ),

  // POST submit — success
  http.post(`${BASE}/audits/submit`, () =>
    HttpResponse.json({
      success: true,
      data: {
        id: "audit-001",
        finalScore: 85,
        grade: "good",
        isRiskTriggered: false,
        repeatInfo: [],
      },
    })
  ),
];
```

### `src/test/msw-server.ts` — thêm `auditHandlers`

```ts
import { setupServer } from "msw/node";
import { authHandlers } from "./handlers/auth.handlers";
import { auditHandlers } from "./handlers/audit.handlers";

export const server = setupServer(...authHandlers, ...auditHandlers);
```

### `src/features/audit/hooks/use-audit-execution.test.ts` *(file mới)*

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test/utils"; // TanStack Query wrapper
import { useAuditSession, useAuditHistory, useSaveDraft, useSubmitAudit } from "./use-audit-execution";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";

const ASSIGNMENT_ID = "asgn-001";

describe("useAuditSession", () => {
  it("trả về session với assignment và checklist", async () => {
    const { result } = renderHook(() => useAuditSession(ASSIGNMENT_ID), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.assignment.id).toBe(ASSIGNMENT_ID);
    expect(result.current.data?.checklist.sections).toHaveLength(1);
    expect(result.current.data?.audit).toBeNull();
  });

  it("không fetch khi assignmentId rỗng", () => {
    const { result } = renderHook(() => useAuditSession(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useAuditHistory", () => {
  it("trả về history bundle", async () => {
    const { result } = renderHook(() => useAuditHistory(ASSIGNMENT_ID), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.assignmentId).toBe(ASSIGNMENT_ID);
    expect(result.current.data?.historiesByCriteriaId).toEqual({});
  });

  it("không fetch khi enabled=false", () => {
    const { result } = renderHook(() => useAuditHistory(ASSIGNMENT_ID, { enabled: false }), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSaveDraft", () => {
  it("gọi PATCH /audits/draft thành công", async () => {
    const { result } = renderHook(() => useSaveDraft(), { wrapper: createWrapper() });
    result.current.mutate({ assignmentId: ASSIGNMENT_ID, violations: [] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useSubmitAudit", () => {
  it("trả về score và grade sau submit", async () => {
    const { result } = renderHook(() => useSubmitAudit(), { wrapper: createWrapper() });
    result.current.mutate({ assignmentId: ASSIGNMENT_ID, violations: [] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.finalScore).toBe(85);
    expect(result.current.data?.grade).toBe("good");
  });

  it("throw khi BE trả 409", async () => {
    server.use(
      http.post("http://localhost:3000/api/audits/submit", () =>
        HttpResponse.json(
          { success: false, error: { message: "Audit assignment changed while the request was in progress" } },
          { status: 409 }
        )
      )
    );
    const { result } = renderHook(() => useSubmitAudit(), { wrapper: createWrapper() });
    result.current.mutate({ assignmentId: ASSIGNMENT_ID, violations: [] });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toContain("changed while the request");
  });
});
```

## `src/test/utils.ts` — nếu chưa có `createWrapper`

```ts
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
```

## Verification

```bash
npm run test
```

Tất cả tests phải pass. Không mock để cheat — nếu type sai sẽ fail tự nhiên.
