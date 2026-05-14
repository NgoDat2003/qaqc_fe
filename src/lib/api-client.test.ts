import { describe, it, expect, beforeEach } from "vitest";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";
import { apiClient } from "./api-client";

// ─── Scenario coverage ────────────────────────────────────────────────────────
// #11 listRequest nhận response không có meta → throw ApiClientError(500)
// #12 API 500 → isError
// #13 apiClient.get vẫn hoạt động (không bị break bởi list method)

const BASE = "http://localhost:3000/api";

describe("apiClient.list", () => {
  it("returns { data, meta } when BE responds correctly", async () => {
    server.use(
      http.get(`${BASE}/items`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "1", name: "Item A" }],
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      )
    );

    const result = await apiClient.list<{ id: string; name: string }>("/items");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Item A");
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it("throws ApiClientError(500) when meta is missing — scenario #11", async () => {
    server.use(
      http.get(`${BASE}/items-no-meta`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "1" }],
          // meta omitted — simulates broken BE
        })
      )
    );

    await expect(apiClient.list("/items-no-meta")).rejects.toMatchObject({
      statusCode: 500,
      message: "Missing pagination meta in response",
    });
  });

  it("throws on 4xx/5xx — scenario #12", async () => {
    server.use(
      http.get(`${BASE}/items-error`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Internal error" } },
          { status: 500 }
        )
      )
    );

    await expect(apiClient.list("/items-error")).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("throws ApiClientError(401) on 401 response", async () => {
    server.use(
      http.get(`${BASE}/items-401`, () => HttpResponse.json({}, { status: 401 }))
    );

    await expect(apiClient.list("/items-401")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("apiClient.get — not broken by list addition", () => {
  it("still returns T directly (not ListResponse) — scenario #13", async () => {
    server.use(
      http.get(`${BASE}/items/detail-1`, () =>
        HttpResponse.json({ success: true, data: { id: "detail-1", name: "Detail" } })
      )
    );

    const result = await apiClient.get<{ id: string; name: string }>("/items/detail-1");
    // get() returns T, not { data, meta }
    expect(result).toHaveProperty("id", "detail-1");
    expect(result).not.toHaveProperty("meta");
  });
});
