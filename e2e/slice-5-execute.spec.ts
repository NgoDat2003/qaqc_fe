import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers/auth.helper"

// Slice quan trọng nhất — cần test kỹ nhất
test.describe("Slice 5 — QC Execute Audit", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "qc")
  })

  test.describe("My Audits list", () => {
    test("Hiển thị assignments được giao cho QC hiện tại", async ({ page }) => {
      await page.goto("/operations/my-audits")
      // Phải có ít nhất 1 assignment (từ seed data)
      await expect(page.locator('[data-testid="assignment-card"]')).toHaveCountGreaterThan(0)
    })

    test("Empty state khi không có assignment", async ({ page }) => {
      // TODO: test với user QC không có assignment
      // Empty state phải có message + không blank white
    })
  })

  test.describe("Execute form — Happy path", () => {
    test("Điền đầy đủ → submit → xem điểm", async ({ page }) => {
      // TODO: implement sau khi có seed data
    })

    test("Lưu nháp → thoát → vào lại → data vẫn còn", async ({ page }) => {
      // TODO: draft persistence
    })
  })

  test.describe("Scoring boundary — business logic quan trọng nhất", () => {
    test("Lỗi lặp lần 4 cùng tiêu chí → auto flag CCP", async ({ page }) => {
      // Fill repeat count = 4 → CCP badge hiện
      // TODO
    })

    test("RISK tiêu chí → toàn bài về 0 dù điểm khác cao", async ({ page }) => {
      // TODO
    })

    test("CCP → chỉ nhóm đó = 0, nhóm khác không ảnh hưởng", async ({ page }) => {
      // TODO
    })

    test("Bắt buộc upload ảnh khi có lỗi", async ({ page }) => {
      // Submit khi có lỗi nhưng chưa upload ảnh → block với message rõ
      // TODO
    })
  })

  test.describe("Mobile UX (iPhone 14)", () => {
    test("Section tabs scroll ngang được", async ({ page }) => {
      // TODO — chạy trên mobile viewport
    })

    test("+/- button đủ lớn để tap (44px)", async ({ page }) => {
      // TODO — check touch target size
    })
  })
})
