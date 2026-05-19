import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { MOCK_ASSIGNMENT_ID } from "@/test/handlers/audit.handlers";
import {
  useAuditSession,
  useAuditHistory,
  useSaveDraft,
  useSubmitAudit,
} from "./use-audit-execution";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useAuditSession", () => {
  it("returns assignment and checklist from session", async () => {
    const { result } = renderHook(() => useAuditSession(MOCK_ASSIGNMENT_ID), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.assignment.id).toBe(MOCK_ASSIGNMENT_ID);
    expect(result.current.data?.checklist.sections).toHaveLength(1);
    expect(result.current.data?.audit).toBeNull();
  });

  it("does not fetch when assignmentId is empty", () => {
    const { result } = renderHook(() => useAuditSession(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useAuditHistory", () => {
  it("returns history bundle with empty historiesByCriteriaId", async () => {
    const { result } = renderHook(() => useAuditHistory(MOCK_ASSIGNMENT_ID), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.assignmentId).toBe(MOCK_ASSIGNMENT_ID);
    expect(result.current.data?.historiesByCriteriaId).toEqual({});
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(
      () => useAuditHistory(MOCK_ASSIGNMENT_ID, { enabled: false }),
      { wrapper }
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSaveDraft", () => {
  it("patches draft successfully", async () => {
    const { result } = renderHook(() => useSaveDraft(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ assignmentId: MOCK_ASSIGNMENT_ID, violations: [] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useSubmitAudit", () => {
  it("returns finalScore and grade on success", async () => {
    const { result } = renderHook(() => useSubmitAudit(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ assignmentId: MOCK_ASSIGNMENT_ID, violations: [] });
    });

    await waitFor(() => {
      expect(result.current.data?.finalScore).toBe(85.0);
      expect(result.current.data?.grade).toBe("good");
      expect(result.current.data?.isRiskTriggered).toBe(false);
    });
  });

  it("throws on 409 stale conflict", async () => {
    server.use(
      http.post(`${BASE}/audits/submit`, () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              message: "Audit assignment changed while the request was in progress",
              statusCode: 409,
            },
          },
          { status: 409 }
        )
      )
    );

    const { result } = renderHook(() => useSubmitAudit(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ assignmentId: MOCK_ASSIGNMENT_ID, violations: [] })
        .catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect((result.current.error as Error).message).toContain("changed while the request");
    });
  });
});
