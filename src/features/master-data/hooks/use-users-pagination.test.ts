import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useUsers } from "./use-users";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import type { User, ListResponse } from "@/shared/types";

// ─── Scenario coverage ────────────────────────────────────────────────────────
// #8  Filter thay đổi → query key thay đổi → re-fetch
// #13 keepPreviousData → không flash khi đổi trang
// Scale: 0 results, page=2 trả về data

const BASE = "http://localhost:3000/api";

const MOCK_USER: User = {
  id: "u1",
  email: "admin@maycha.com",
  fullName: "Admin",
  isActive: true,
  roleAssignments: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function makeListResponse(users: User[], page = 1, total = users.length): ListResponse<User> {
  return {
    data: users,
    meta: { page, limit: 20, total, totalPages: Math.ceil(total / 20) },
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useUsers — pagination params", () => {
  it("forwards page and limit to API query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE}/users`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ success: true, ...makeListResponse([MOCK_USER], 2, 25) });
      })
    );

    const { result } = renderHook(() => useUsers({ page: 2, limit: 20 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(capturedUrl).toContain("page=2");
    expect(capturedUrl).toContain("limit=20");
  });

  it("query key includes params — different params = different cache entries", async () => {
    let fetchCount = 0;
    server.use(
      http.get(`${BASE}/users`, () => {
        fetchCount++;
        return HttpResponse.json({ success: true, ...makeListResponse([MOCK_USER]) });
      })
    );

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const w = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children);

    // First fetch: page=1
    const hook1 = renderHook(() => useUsers({ page: 1 }), { wrapper: w });
    await waitFor(() => expect(hook1.result.current.isSuccess).toBe(true));

    // Second fetch: page=2 — different key, must re-fetch
    const hook2 = renderHook(() => useUsers({ page: 2 }), { wrapper: w });
    await waitFor(() => expect(hook2.result.current.isSuccess).toBe(true));

    expect(fetchCount).toBe(2);
  });

  it("returns ListResponse shape with data array and meta", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
        HttpResponse.json({
          success: true,
          data: [MOCK_USER],
          meta: { page: 1, limit: 20, total: 42, totalPages: 3 },
        })
      )
    );

    const { result } = renderHook(() => useUsers({ page: 1, limit: 20 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.meta.total).toBe(42);
    expect(result.current.data?.meta.totalPages).toBe(3);
  });

  it("handles 0 results gracefully — scenario Scale:0", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      )
    );

    const { result } = renderHook(() => useUsers({ page: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(0);
    expect(result.current.data?.meta.total).toBe(0);
  });

  it("uses keepPreviousData — old data stays while fetching new page — scenario #13", async () => {
    let callCount = 0;
    server.use(
      http.get(`${BASE}/users`, async () => {
        callCount++;
        // Second call is deliberately slow to create a measurable loading window
        if (callCount === 2) await new Promise((r) => setTimeout(r, 80));
        return HttpResponse.json({
          success: true,
          data: [{ ...MOCK_USER, id: `u${callCount}` }],
          meta: { page: callCount, limit: 20, total: 40, totalPages: 2 },
        });
      })
    );

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const w = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children);

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useUsers({ page, limit: 20 }),
      { wrapper: w, initialProps: { page: 1 } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.meta.page).toBe(1);

    // Switch to page 2 — triggers new fetch
    rerender({ page: 2 });

    // keepPreviousData: while isFetching=true, old page-1 data must still be defined
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data).not.toBeUndefined();
    expect(result.current.data?.meta.page).toBe(1); // old data still present

    // Eventually resolves to page 2
    await waitFor(() => expect(result.current.data?.meta.page).toBe(2));
    expect(result.current.isFetching).toBe(false);
  });
});
