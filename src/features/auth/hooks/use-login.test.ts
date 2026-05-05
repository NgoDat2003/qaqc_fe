import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw-server"
import { useLogin } from "./use-login"
import { createWrapper } from "@/test/test-utils"

const API = "http://localhost:3000/api"

describe("useLogin", () => {

  // ✅ Happy path
  describe("Thành công", () => {
    it("login đúng email + password → trả về user và roles", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json({
            success: true,
            data: {
              user: { id: "1", email: "qam@test.com", fullName: "QA Manager" },
              activeRole: "qa_manager",
              availableRoles: ["qa_manager"],
            },
          })
        )
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      await act(async () => {
        await result.current.mutateAsync({ email: "qam@test.com", password: "Test@1234" })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  // ❌ Error paths
  describe("Lỗi từ server", () => {
    it("sai password → throw error với message rõ ràng", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json(
            { success: false, error: { statusCode: 401, message: "Sai email hoặc mật khẩu" } },
            { status: 401 }
          )
        )
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      await act(async () => {
        await result.current.mutateAsync({ email: "qam@test.com", password: "wrong" })
          .catch(() => {})
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toBe("Sai email hoặc mật khẩu")
    })

    it("email không tồn tại → error 401", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json(
            { success: false, error: { statusCode: 401, message: "Sai email hoặc mật khẩu" } },
            { status: 401 }
          )
        )
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      await act(async () => {
        await result.current.mutateAsync({ email: "notexist@test.com", password: "anything" })
          .catch(() => {})
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it("server 500 → error được handle, không crash app", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json(
            { success: false, error: { statusCode: 500, message: "Internal server error" } },
            { status: 500 }
          )
        )
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      await act(async () => {
        await result.current.mutateAsync({ email: "qam@test.com", password: "Test@1234" })
          .catch(() => {})
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })

    it("network timeout → error được handle", async () => {
      server.use(
        http.post(`${API}/auth/login`, () => HttpResponse.error())
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      await act(async () => {
        await result.current.mutateAsync({ email: "qam@test.com", password: "Test@1234" })
          .catch(() => {})
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  // ⏳ Loading state
  describe("Loading state", () => {
    it("isPending = true trong khi đang gọi API", async () => {
      let resolveRequest: () => void
      server.use(
        http.post(`${API}/auth/login`, () =>
          new Promise((resolve) => {
            resolveRequest = () => resolve(HttpResponse.json({ success: true, data: {} }))
          })
        )
      )

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
      act(() => {
        result.current.mutate({ email: "qam@test.com", password: "Test@1234" })
      })

      await waitFor(() => expect(result.current.isPending).toBe(true))
      resolveRequest!()
    })
  })
})
