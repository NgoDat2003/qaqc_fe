import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useMyAssignments } from "./use-audit-plans";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { MOCK_ASSIGNMENT } from "@/test/handlers/audit.handlers";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useMyAssignments", () => {
  it("returns assignment list on success", async () => {
    const { result } = renderHook(() => useMyAssignments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe(MOCK_ASSIGNMENT.id);
    expect(result.current.data?.[0].status).toBe("pending");
  });

  it("returns empty array when no assignments", async () => {
    server.use(
      http.get(`${BASE}/audit-plans/my-assignments`, () =>
        HttpResponse.json({ success: true, data: [] })
      )
    );

    const { result } = renderHook(() => useMyAssignments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it("errors gracefully on 401", async () => {
    server.use(
      http.get(`${BASE}/audit-plans/my-assignments`, () =>
        HttpResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      )
    );

    const { result } = renderHook(() => useMyAssignments(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
