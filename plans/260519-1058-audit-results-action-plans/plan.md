---
title: "Audit Results + Action Plans + Notification Bell"
description: "Implement audit results list/detail, correction request flow, action plan CRUD, and notification bell"
status: pending
priority: P1
effort: 4h
branch: feat/audit-results-action-plans
tags: [audit, action-plan, correction, notification, multi-role]
created: 2026-05-19
blockedBy: []
blocks: []
---

# Audit Results + Action Plans + Notification Bell

## Context

BE đã hoàn thiện toàn bộ API (xem `qaqc-be/docs/audit-results-action-plans-fe-handoff.md`).
FE hiện tại: `qc/results` và `qc/action-plans` là stubs. Notification bell chưa kết nối API.

## Scope

```
GET  /api/audits                            → qc/results (list, all roles)
GET  /api/audits/:id                        → qc/results/[id] (detail)
POST /api/audits/:id/correction-requests    → SM request correction
POST /api/audit-correction-requests/:id/approve|reject → QAM review
PATCH /api/audits/:id/correction            → QAM edit audit
POST  /api/audits/:id/action-plan           → Create AP
GET   /api/action-plans                     → qc/action-plans (list)
GET   /api/action-plans/:id                 → qc/action-plans/[id] (detail)
PATCH /api/action-plans/:id                 → SM update items
POST  /api/action-plans/:id/submit|reject|close → SM submit / QAM review
GET   /api/notifications + /unread-count    → Bell in layout
PATCH /api/notifications/:id/read + /read-all
```

## Routing Strategy (YAGNI)

- `qc/results` + `qc/results/[id]` = shared for ALL roles (BE scopes data by role)
- `qc/action-plans` + `qc/action-plans/[id]` = shared for all relevant roles
- Thêm sidebar items cho SM/AM/QAM trỏ vào cùng routes

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | [API Contracts](./phase-01-api-contracts.md) | 30m | pending |
| 2 | [Audit Results List](./phase-02-audit-results-list.md) | 20m | pending |
| 3 | [Audit Result Detail](./phase-03-audit-result-detail.md) | 60m | pending |
| 4 | [Action Plan List](./phase-04-action-plan-list.md) | 20m | pending |
| 5 | [Action Plan Detail](./phase-05-action-plan-detail.md) | 60m | pending |
| 6 | [Notification Bell](./phase-06-notification-bell.md) | 20m | pending |
| 7 | [Sidebar + Routing](./phase-07-sidebar-routing.md) | 10m | pending |

## Key Business Rules (từ BE docs)

- QC/SM/AM: BE tự scope theo role, FE dùng cùng 1 endpoint
- Không cho SM tạo correction request nếu audit đã có AP
- Không cho QAM edit correction nếu chưa có approved request
- SM submit AP: tất cả items phải có rootCause/remediation/fixedAt/assigneeName
- Items critical/risk/auto_CCP: bắt buộc có remediationImages trước submit
- Upload ảnh trước → lấy imageIds → PATCH AP
- `fixedAt` = ngày thực tế sửa xong (ISO string), không phải deadline
- `assigneeName` = text, không phải user ID

## Files sửa đổi

### Modify
- `src/shared/types/index.ts` — thêm AuditResultListItem, AuditResultDetail, CorrectionRequestDto, ActionPlanDetail, ActionPlanItem, NotificationDto types
- `src/features/audit/api/audit.api.ts` — thêm methods
- `src/features/audit/index.ts` — export hooks mới
- `src/app/(dashboard)/qc/results/page.tsx` — implement thật
- `src/app/(dashboard)/qc/action-plans/page.tsx` — implement thật
- `src/shared/components/app-sidebar.tsx` — thêm SM/AM/QAM nav items

### Create
- `src/features/audit/hooks/use-audit-results.ts`
- `src/features/audit/hooks/use-action-plans.ts`
- `src/features/notifications/` — api + hooks
- `src/app/(dashboard)/qc/results/[id]/page.tsx`
- `src/app/(dashboard)/qc/results/[id]/_components/` (score-overview, group-scores, violations-list, correction-request-panel, create-ap-button)
- `src/app/(dashboard)/qc/action-plans/[id]/page.tsx`
- `src/app/(dashboard)/qc/action-plans/[id]/_components/` (ap-item-card, ap-submit-bar, qam-review-panel)
- `src/shared/components/notification-panel.tsx`

## Todo Summary

### Phase 1
- [ ] Types: AuditResultListItem, AuditResultDetail, CorrectionRequestDto, ActionPlanDetail, ActionPlanItem, NotificationDto
- [ ] API methods + hooks cho tất cả endpoints
- [ ] `npm run typecheck`

### Phase 2
- [ ] `qc/results/page.tsx`: DataTable + metric cards (Tổng/Đạt/Không đạt/Báo động)
- [ ] Columns: Store, Auditor, Checklist, Score/Grade, Date, AP Status, Correction badge

### Phase 3
- [ ] `qc/results/[id]/page.tsx`: score overview + group breakdown + violations
- [ ] SM: correction request form + badge "Đang chờ QA review"
- [ ] QAM: approve/reject dialog + edit correction form + create AP button

### Phase 4
- [ ] `qc/action-plans/page.tsx`: DataTable + filter by status + metric cards

### Phase 5
- [ ] `qc/action-plans/[id]/page.tsx`: items list với violation info + SM fields
- [ ] SM: inline edit per item (rootCause/remediation/fixedAt/assigneeName/images)
- [ ] SM submit + validation (required fields + critical/risk evidence check)
- [ ] QAM: reject dialog (reviewNote required) + close button

### Phase 6
- [ ] `useNotifications` + `useUnreadCount` hooks
- [ ] Notification panel trong layout header bell icon
- [ ] Mark read on click, mark all read

### Phase 7
- [ ] Sidebar: QAM → Kết quả audit + Action Plan; SM → Kết quả + Action Plan; AM → read-only
- [ ] Update `getLandingPathByRole` cho SM → `/qc/results` hoặc `/qc/action-plans`
