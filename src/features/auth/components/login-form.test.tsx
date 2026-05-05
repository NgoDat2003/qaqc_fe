import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw-server"
import { LoginForm } from "./login-form"
import { createWrapper } from "@/test/test-utils"

const API = "http://localhost:3000/api"
const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

function setup() {
  const user = userEvent.setup()
  render(<LoginForm />, { wrapper: createWrapper() })
  return {
    user,
    emailInput: () => screen.getByLabelText(/email/i),
    passwordInput: () => screen.getByLabelText(/mật khẩu|password/i),
    submitBtn: () => screen.getByRole("button", { name: /đăng nhập|login/i }),
  }
}

describe("LoginForm", () => {

  // ✅ Render
  describe("Render", () => {
    it("hiển thị đủ email input, password input, submit button", () => {
      const { emailInput, passwordInput, submitBtn } = setup()
      expect(emailInput()).toBeInTheDocument()
      expect(passwordInput()).toBeInTheDocument()
      expect(submitBtn()).toBeInTheDocument()
    })

    it("submit button không disabled khi form trống (để user biết có thể click)", () => {
      const { submitBtn } = setup()
      expect(submitBtn()).not.toBeDisabled()
    })
  })

  // ❌ Validation — field-level errors
  describe("Validation trước khi submit", () => {
    it("submit khi email trống → error tại field email (không phải chỉ toast)", async () => {
      const { user, submitBtn } = setup()
      await user.click(submitBtn())
      expect(await screen.findByText(/email.*bắt buộc|email.*required/i)).toBeInTheDocument()
    })

    it("submit khi password trống → error tại field password", async () => {
      const { user, emailInput, submitBtn } = setup()
      await user.type(emailInput(), "test@test.com")
      await user.click(submitBtn())
      expect(await screen.findByText(/mật khẩu.*bắt buộc|password.*required/i)).toBeInTheDocument()
    })

    it("submit form hoàn toàn rỗng → cả 2 field đều có error", async () => {
      const { user, submitBtn } = setup()
      await user.click(submitBtn())
      const errors = await screen.findAllByRole("alert")
      expect(errors.length).toBeGreaterThanOrEqual(2)
    })

    it("email sai format → error format", async () => {
      const { user, emailInput, submitBtn } = setup()
      await user.type(emailInput(), "notanemail")
      await user.click(submitBtn())
      expect(await screen.findByText(/email.*không hợp lệ|invalid email/i)).toBeInTheDocument()
    })

    it("password quá ngắn (< 6 ký tự) → error", async () => {
      const { user, emailInput, passwordInput, submitBtn } = setup()
      await user.type(emailInput(), "test@test.com")
      await user.type(passwordInput(), "123")
      await user.click(submitBtn())
      expect(await screen.findByText(/ít nhất 6|at least 6/i)).toBeInTheDocument()
    })
  })

  // ⏳ Loading state
  describe("Loading state khi submit", () => {
    it("button disabled + hiện spinner trong khi đang login", async () => {
      let resolveRequest: () => void
      server.use(
        http.post(`${API}/auth/login`, () =>
          new Promise((resolve) => {
            resolveRequest = () =>
              resolve(HttpResponse.json({ success: true, data: {} }))
          })
        )
      )

      const { user, emailInput, passwordInput, submitBtn } = setup()
      await user.type(emailInput(), "qam@test.com")
      await user.type(passwordInput(), "Test@1234")
      await user.click(submitBtn())

      await waitFor(() => expect(submitBtn()).toBeDisabled())
      resolveRequest!()
    })
  })

  // ✅ Success
  describe("Login thành công", () => {
    it("redirect sang /dashboard sau khi login đúng", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json({
            success: true,
            data: {
              user: { id: "1", email: "qam@test.com", fullName: "QAM" },
              activeRole: "qa_manager",
              availableRoles: ["qa_manager"],
            },
          })
        )
      )

      const { user, emailInput, passwordInput, submitBtn } = setup()
      await user.type(emailInput(), "qam@test.com")
      await user.type(passwordInput(), "Test@1234")
      await user.click(submitBtn())

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"))
    })
  })

  // ❌ API errors → hiện trong form
  describe("Lỗi từ API", () => {
    it("sai password → hiện error trong form (không redirect)", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json(
            { success: false, error: { statusCode: 401, message: "Sai email hoặc mật khẩu" } },
            { status: 401 }
          )
        )
      )

      const { user, emailInput, passwordInput, submitBtn } = setup()
      await user.type(emailInput(), "qam@test.com")
      await user.type(passwordInput(), "wrongpassword")
      await user.click(submitBtn())

      expect(await screen.findByText(/sai email hoặc mật khẩu/i)).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it("server error → hiện thông báo thân thiện, không crash", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json(
            { success: false, error: { statusCode: 500, message: "Internal server error" } },
            { status: 500 }
          )
        )
      )

      const { user, emailInput, passwordInput, submitBtn } = setup()
      await user.type(emailInput(), "qam@test.com")
      await user.type(passwordInput(), "Test@1234")
      await user.click(submitBtn())

      // Phải có error message — không được blank/crash
      expect(await screen.findByRole("alert")).toBeInTheDocument()
    })
  })

  // ♿ Accessibility
  describe("Accessibility", () => {
    it("Enter trên form submit", async () => {
      server.use(
        http.post(`${API}/auth/login`, () =>
          HttpResponse.json({ success: true, data: { user: {}, activeRole: "qa_manager", availableRoles: [] } })
        )
      )

      const { user, emailInput, passwordInput } = setup()
      await user.type(emailInput(), "qam@test.com")
      await user.type(passwordInput(), "Test@1234")
      await user.keyboard("{Enter}")

      await waitFor(() => expect(mockPush).toHaveBeenCalled())
    })

    it("Tab navigation: email → password → submit đúng thứ tự", async () => {
      const { user, emailInput } = setup()
      await user.click(emailInput())
      await user.tab()
      expect(screen.getByLabelText(/mật khẩu|password/i)).toHaveFocus()
      await user.tab()
      expect(screen.getByRole("button", { name: /đăng nhập|login/i })).toHaveFocus()
    })
  })
})
