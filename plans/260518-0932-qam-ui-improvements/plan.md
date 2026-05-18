---
title: "QAM UI Improvements — 4 enhancements"
description: "Back button, date columns, column filters, audit plan edit UI"
status: in-progress
priority: P2
effort: 1h15m
branch: feat/checklist-builder-improvements
tags: [qam, ui, audit-plans, checklist, users]
created: 2026-05-18
---

# QAM UI Improvements

Bốn cải tiến UI nhỏ cho trang QAM. Tất cả thực hiện trên branch `feat/checklist-builder-improvements`.

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | [Back button trong PageHeader](./phase-01-back-button.md) | 10m | pending |
| 2 | [Cột thời gian trong Audit Plan list](./phase-02-date-columns.md) | 10m | pending |
| 3 | [Column filter cho 3 bảng](./phase-03-column-filters.md) | 15m | pending |
| 4 | [Audit Plan edit UI](./phase-04-audit-plan-edit.md) | 40m | pending |

## Todo

### Phase 1 — Back button
- [ ] Add `backHref?: string` prop vào `src/shared/components/page-header.tsx`
- [ ] Render `<Link>` với `ArrowLeft` icon khi prop set
- [ ] Apply `backHref="/qam/audit-plans"` ở `audit-plans/[id]/page.tsx`
- [ ] Apply `backHref="/qam/checklists"` ở `checklists/[id]/page.tsx`
- [ ] `npm run typecheck`

### Phase 2 — Date columns
- [ ] Thêm cột "Thời gian" vào `audit-plans/page.tsx` (chèn giữa "Kế hoạch" và "Tiến độ")
- [ ] Sort theo `startDate`, format `dd/MM/yyyy`, `hideOnMobile`
- [ ] `npm run typecheck`

### Phase 3 — Column filters
- [ ] `audit-plans/page.tsx`: thêm `filterKey`/`filterOptions` vào cột "Trạng thái"
- [ ] `qam/criteria/page.tsx`: thêm `filterKey` cho cột "Nhóm" và "Trạng thái" (giữ Select dropdowns)
- [ ] `master-data/users/page.tsx`: thêm `filterKey`/`filterOptions` vào cột "Trạng thái" (handle bool→string)
- [ ] `npm run typecheck`

### Phase 4 — Audit Plan edit (updated per BE docs 2026-05-18)
- [ ] `shared/types/index.ts`: Thêm `"draft"` vào `AuditPlanFull.status`
- [ ] `audit.api.ts`: Thêm `updateAuditPlan`, `publishAuditPlan`, `updateAssignment`, `removeAssignment`
- [ ] `use-audit-plans.ts`: Thêm 4 hooks tương ứng
- [ ] `audit-plans/new/page.tsx`: Sau submit thành công → redirect đến `/qam/audit-plans/${newPlan.id}` (detail draft) thay vì `/qam/audit-plans` list
- [ ] `audit-plans/[id]/page.tsx`:
  - Nút "Giao việc (Publish)" khi `status === "draft"` 
  - Nút "Chỉnh sửa" khi `draft` (full: name/checklist/dates) hoặc `open` (limited: name/dates)
  - `RowActions` cho assignment: editable condition = `status === "pending" && !auditId`
  - Filter cột "Trạng thái" 3 option
- [ ] `_components/edit-plan-dialog.tsx`: hỗ trợ `mode: "draft" | "open"` — draft cho phép thêm/xóa assignments
- [ ] `_components/change-auditor-dialog.tsx`
- [ ] localStorage draft auto-save cho `new/page.tsx`
- [ ] `npm run typecheck` + smoke test

## Key dependencies

- Tất cả phase độc lập — có thể làm tuần tự bất kỳ thứ tự nào
- Phase 4 phụ thuộc API BE: nếu BE chưa có endpoint, toast lỗi nhẹ nhàng, UI vẫn render
- `SortableTable` đã có sẵn `filterKey`/`filterOptions` — chỉ cần khai báo
- Không có breaking change

## Success criteria

- `npm run typecheck` pass
- `npm run lint` pass
- Smoke test thủ công 4 trang: detail pages có back arrow, audit plan list có cột thời gian + filter cột, criteria/users có filter cột bổ sung, edit plan dialog mở/đóng và toast lỗi nếu BE chưa sẵn sàng
- Khi tất cả phase xong: cập nhật status frontmatter → `completed`
