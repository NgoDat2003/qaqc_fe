import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useLogin } from "./use-login";
import { useAuthStore } from "@/stores/auth.store";
import { server } from "@/test/msw-server";
import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000/api";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useLogin", () => {
  it("success → sets auth store with user and role", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: "qam@maycha.com" });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("qam@maycha.com");
    expect(state.activeRole).toBe("qa_manager");
  });

  it("wrong credentials → mutation errors, store stays unauthenticated", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: "wrong@maycha.com" }).catch(() => {});
    });

    expect(result.current.isError).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("network error → mutation errors", async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () => HttpResponse.error())
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: "qam@maycha.com" }).catch(() => {});
    });

    expect(result.current.isError).toBe(true);
  });
});
