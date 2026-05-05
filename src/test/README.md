# Testing Conventions

## Triết lý: Test boundary, không phải test code

Test nên verify **behavior từ góc nhìn user**, không phải implementation detail.

---

## Unit Test (Vitest) — Hook & Logic

### Template

```ts
describe("useBrands", () => {
  // ✅ Happy path
  it("trả về list brands khi API thành công", async () => { ... })

  // ✅ Empty state
  it("trả về array rỗng khi API trả về []", async () => { ... })

  // ✅ Error boundary
  it("trả về error khi API 500", async () => { ... })
  it("trả về error khi network timeout", async () => { ... })
  it("redirect /login khi API 401", async () => { ... })

  // ✅ Business edge cases
  it("lỗi lặp lần 4 cùng tiêu chí → auto flag CCP", async () => { ... })
  it("RISK flag → finalScore = 0 dù điểm khác cao", async () => { ... })
  it("CCP flag → chỉ nhóm đó = 0, nhóm khác giữ nguyên", async () => { ... })
})
```

---

## Component Test (RTL) — UI Behavior

### Template

```tsx
describe("BrandDrawer", () => {
  // ✅ Render states
  it("hiển thị form tạo mới khi không có brand prop", () => { ... })
  it("hiển thị form sửa với data đã điền khi có brand prop", () => { ... })
  it("hiển thị skeleton loading khi đang submit", () => { ... })

  // ✅ Interaction
  it("disable submit khi form rỗng", () => { ... })
  it("hiển thị validation error khi submit form thiếu field bắt buộc", () => { ... })
  it("gọi onSuccess và đóng drawer sau khi tạo thành công", () => { ... })
  it("hiển thị toast error và giữ drawer mở khi API fail", () => { ... })

  // ✅ Accessibility
  it("có thể navigate bằng keyboard, focus vào input đầu tiên khi mở", () => { ... })
  it("Escape đóng drawer", () => { ... })
})
```

---

## gstack UI Test — UX Quality

Mục đích: đánh giá **trải nghiệm người dùng thực tế**, không phải logic.

### Checklist khi dùng gstack:

```
Loading states:
  □ Skeleton hiển thị trước khi data về, không flash trắng
  □ Button disabled + spinner khi đang submit

Empty states:
  □ Empty state có icon + message có nghĩa, không blank white
  □ Empty state có CTA button hợp lý

Error states:
  □ Error message dùng ngôn ngữ user hiểu (không phải "Error 500")
  □ Có retry button hoặc hướng dẫn tiếp theo

Mobile UX:
  □ Touch target tối thiểu 44px
  □ Keyboard không che input quan trọng
  □ Scroll smooth, không jank

Form UX:
  □ Validation error hiển thị tại field, không chỉ toast
  □ Focus tự động vào field lỗi đầu tiên
  □ Loading state rõ ràng khi submit
```

---

## Cấu trúc file test

```
src/
  features/
    auth/
      hooks/
        use-login.ts
        use-login.test.ts       ← unit test cùng cấp
      components/
        login-form.tsx
        login-form.test.tsx     ← component test cùng cấp
e2e/
  auth.spec.ts                  ← Playwright E2E
  audit-execution.spec.ts
```
