import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import {
  useReviewActionPlan,
  useCloseActionPlan,
  useUpdateActionPlan,
  useSubmitActionPlan,
} from "./use-action-plans";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { MOCK_ACTION_PLAN } from "@/test/handlers/action-plan.handlers";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useReviewActionPlan", () => {
  it("action=reject → BE receives correct body", async () => {
    let captured: unknown;
    server.use(
      http.post(`${BASE}/action-plans/:id/confirm`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          success: true,
          data: { ...MOCK_ACTION_PLAN, status: "rejected" },
        });
      })
    );

    const { result } = renderHook(() => useReviewActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "ap-1", action: "reject" });
    });

    expect((captured as { action: string }).action).toBe("reject");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("action=confirm → BE receives action: confirm", async () => {
    let captured: unknown;
    server.use(
      http.post(`${BASE}/action-plans/:id/confirm`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: MOCK_ACTION_PLAN });
      })
    );

    const { result } = renderHook(() => useReviewActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "ap-1", action: "confirm" });
    });

    expect((captured as { action: string }).action).toBe("confirm");
  });

  it("reviewNote is forwarded to BE", async () => {
    let captured: unknown;
    server.use(
      http.post(`${BASE}/action-plans/:id/confirm`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: MOCK_ACTION_PLAN });
      })
    );

    const { result } = renderHook(() => useReviewActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "ap-1", action: "reject", reviewNote: "Fix immediately" });
    });

    expect((captured as { reviewNote: string }).reviewNote).toBe("Fix immediately");
  });
});

describe("useCloseActionPlan", () => {
  it("takes plain id — no evidenceIds required", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(`${BASE}/action-plans/:id/close`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          success: true,
          data: { ...MOCK_ACTION_PLAN, status: "closed" },
        });
      })
    );

    const { result } = renderHook(() => useCloseActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("ap-1");
    });

    expect(result.current.isSuccess).toBe(true);
    expect(capturedBody).not.toHaveProperty("evidenceIds");
  });
});

describe("useUpdateActionPlan", () => {
  it("sends actionDescription field (not remediation)", async () => {
    let captured: unknown;
    server.use(
      http.patch(`${BASE}/action-plans/:id`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: MOCK_ACTION_PLAN });
      })
    );

    const { result } = renderHook(() => useUpdateActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        id: "ap-1",
        actionDescription: "Cleaned the floor daily",
        deadline: "2026-06-01",
      });
    });

    expect((captured as Record<string, unknown>).actionDescription).toBe("Cleaned the floor daily");
    expect((captured as Record<string, unknown>).remediation).toBeUndefined();
  });
});

describe("useSubmitActionPlan", () => {
  it("submits AP and transitions to submitted", async () => {
    const { result } = renderHook(() => useSubmitActionPlan(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("ap-1");
    });
    expect(result.current.isSuccess).toBe(true);
  });
});
