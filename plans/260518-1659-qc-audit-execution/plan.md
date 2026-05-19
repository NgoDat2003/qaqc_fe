---
title: "QC Audit Execution Flow"
description: "Implement full QC auditor flow: my-assignments list → audit execute page → submit + result"
status: in-progress
priority: P1
effort: 3.5h
branch: feat/qc-audit-execution
tags: [qc, audit, execution, upload, submit]
created: 2026-05-18
blockedBy: []
blocks: []
---

# QC Audit Execution Flow

## Context

BE đã hoàn thiện toàn bộ API cho luồng QC (xem `qaqc-be/docs/qc-fe-handoff.md`).
FE hiện tại:
- `qc/my-assignments/page.tsx` — placeholder "Đang xây dựng..."
- `src/features/audit/api/audit.api.ts` — có `getMyAssignments()` nhưng thiếu các method execute
- Chưa có trang execute, components, hooks, hay MSW handlers

## Scope

Luồng QC hoàn chỉnh từ danh sách việc đến kết quả submit:
```
GET /api/audit-plans/my-assignments       → qc/my-assignments
  ↓
GET /api/audits/assignments/:id           → qc/audits/[assignmentId]
  ↓ (background)
GET /api/audits/assignments/:id/history   → cache vào hook
  ↓
POST /api/upload/images                   → per violation image
  ↓
PATCH /api/audits/draft                   → auto-save debounced
  ↓
POST /api/audits/submit                   → score + read-only
```

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | [API Contracts](./phase-01-api-contracts.md) | 30m | pending |
| 2 | [My Assignments Page](./phase-02-my-assignments.md) | 20m | pending |
| 3 | [Execute Page — Core](./phase-03-execute-page.md) | 70m | pending |
| 4 | [Evidence Upload](./phase-04-evidence-upload.md) | 30m | pending |
| 5 | [Submit + Result](./phase-05-submit-result.md) | 30m | pending |
| 6 | [Tests](./phase-06-tests.md) | 30m | pending |

## Key Files

### Sửa đổi
- `src/shared/types/index.ts` — thêm `AuditSession`, `AuditHistoryBundle`, `AuditWriteBody`, `UploadedImage`
- `src/shared/api/upload.api.ts` — sửa endpoint `/upload/evidence` → `/upload/images`, mở rộng return type
- `src/features/audit/api/audit.api.ts` — thêm 4 method execute
- `src/app/(dashboard)/qc/my-assignments/page.tsx` — implement thật thay vì placeholder

### Tạo mới
- `src/features/audit/hooks/use-audit-execution.ts` — TQ hooks cho execute flow
- `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx` — execute page
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/section-tab-bar.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/criteria-item-card.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/evidence-uploader.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/submit-bar.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/submit-confirm-dialog.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/audit-result-panel.tsx`
- `src/test/handlers/audit.handlers.ts` — MSW mocks

## Business Rules (từ BE docs)

- QC không truyền `auditorId`, `repeatCount`, `finalScore`, `grade` — BE tự tính
- QC không xem điểm trước submit
- `isAuditWindowOpen: false` → render read-only, disable mọi thao tác
- Draft đầu tiên: `pending → in_progress`
- Submit xong: `in_progress → completed`, trang chuyển read-only
- `409 Audit assignment changed` → refetch session, cập nhật lại màn hình
- History bundle gọi background sau khi trang render xong (không block UI)

## Todo

### Phase 1 — API Contracts
- [ ] `shared/types/index.ts`: Thêm `AuditSession`, `AuditHistoryBundle`, `AuditWriteBody`, `UploadedImage`
- [ ] `upload.api.ts`: Sửa endpoint + return type
- [ ] `audit.api.ts`: Thêm `getAuditSession`, `getAuditHistory`, `saveDraft`, `submitAudit`
- [ ] `use-audit-execution.ts`: Tạo 4 hooks
- [ ] `npm run typecheck`

### Phase 2 — My Assignments
- [ ] `qc/my-assignments/page.tsx`: DataTable với cột Store, Plan, Trạng thái, Ngày audit
- [ ] Click row → navigate `/qc/audits/${assignment.id}`
- [ ] StatusBadge cho trạng thái, badge "Ngoài cửa sổ audit" nếu `!isAuditWindowOpen`
- [ ] `npm run typecheck`

### Phase 3 — Execute Page Core
- [ ] Route `qc/audits/[assignmentId]/page.tsx` — load session, render layout
- [ ] `useReducer` cho violations state: `Record<criteriaId, DraftViolation>`
- [ ] Restore draft từ `audit.violations` khi session load
- [ ] `section-tab-bar.tsx`: Tabs theo sections của checklist
- [ ] `criteria-item-card.tsx`: +/- numErrors, note textarea, history display
- [ ] Auto-save draft debounced 1.5s sau mỗi thay đổi
- [ ] `npm run typecheck`

### Phase 4 — Evidence Upload
- [ ] `evidence-uploader.tsx`: input file, preview ảnh, xóa ảnh
- [ ] Gọi `uploadApi.uploadImages` per file, lưu `imageId` vào violation state
- [ ] Error handling: >5MB, sai type, upload fail
- [ ] `npm run typecheck`

### Phase 5 — Submit + Result
- [ ] `submit-bar.tsx`: sticky bottom, count violations, nút submit
- [ ] `submit-confirm-dialog.tsx`: xác nhận submit
- [ ] Submit → hiển thị `audit-result-panel.tsx` (điểm, grade, repeat info)
- [ ] `409` → toast "Dữ liệu thay đổi, đang tải lại..." → refetch
- [ ] `isAuditWindowOpen: false` hoặc `status === "completed"` → read-only mode
- [ ] `npm run typecheck`

### Phase 6 — Tests
- [ ] `src/test/handlers/audit.handlers.ts`: MSW cho my-assignments + execute endpoints
- [ ] `use-audit-execution.test.ts`: hooks test với MSW
- [ ] `npm run test`
