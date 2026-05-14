import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useAnalyticsOverview } from "./use-analytics";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { ApiClientError } from "@/lib/api-client";
import { MOCK_ANALYTICS } from "@/test/handlers/analytics.handlers";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useAnalyticsOverview", () => {
  it("success → returns analytics data", async () => {
    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalAudits).toBe(MOCK_ANALYTICS.totalAudits);
    expect(result.current.data?.passRate).toBe(0.83);
    expect(result.current.data?.recentAudits).toHaveLength(1);
  });

  it("403 → error is ApiClientError with statusCode 403, does not retry", async () => {
    server.use(
      http.get(`${BASE}/analytics/overview`, () =>
        HttpResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      )
    );

    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(ApiClientError);
    expect((result.current.error as ApiClientError).statusCode).toBe(403);
  });

  it("500 server error → hook errors, does not crash", async () => {
    server.use(
      http.get(`${BASE}/analytics/overview`, () =>
        HttpResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useAnalyticsOverview(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
