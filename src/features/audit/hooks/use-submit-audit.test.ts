import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useSubmitAudit } from "./use-audit-execute";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { MOCK_SUBMIT_RESULT } from "@/test/handlers/audit.handlers";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

const VALID_DRAFT = {
  assignmentId: "assign-1",
  violations: [{ criteriaId: "crit-1", numErrors: 2, note: "dirty floor" }],
};

describe("useSubmitAudit", () => {
  it("success → returns SubmitAuditResponse with repeatInfo", async () => {
    const { result } = renderHook(() => useSubmitAudit(), { wrapper });

    let response: typeof MOCK_SUBMIT_RESULT | undefined;
    await act(async () => {
      response = await result.current.mutateAsync(VALID_DRAFT);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(response?.finalScore).toBe(85.5);
    expect(response?.grade).toBe("good");
    expect(response?.repeatInfo).toHaveLength(1);
    expect(response?.repeatInfo[0].repeatLabel).toBe("first");
  });

  it("empty violations → still submits successfully (score = 100 from BE)", async () => {
    const { result } = renderHook(() => useSubmitAudit(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ assignmentId: "assign-1", violations: [] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("completed assignment → 400 error", async () => {
    const { result } = renderHook(() => useSubmitAudit(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ assignmentId: "completed-assign", violations: [] })
        .catch(() => {});
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toMatch(/completed/i);
  });

  it("payload never includes repeatCount", async () => {
    let captured: unknown;
    server.use(
      http.post(`${BASE}/audits/submit`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: MOCK_SUBMIT_RESULT });
      })
    );

    const { result } = renderHook(() => useSubmitAudit(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(VALID_DRAFT);
    });

    expect((captured as Record<string, unknown>).violations).toBeDefined();
    const violations = (captured as { violations: unknown[] }).violations;
    violations.forEach((v) => {
      expect(v).not.toHaveProperty("repeatCount");
    });
  });
});
