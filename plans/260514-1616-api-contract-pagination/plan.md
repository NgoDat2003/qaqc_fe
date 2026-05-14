---
title: FE Handoff — API Contract & Pagination
status: completed
priority: high
created: 2026-05-14
completed: 2026-05-14
blockedBy: []
blocks: []
---

# FE Handoff — API Contract & Pagination

Align FE với BE branch `codex/api-contract-pagination`. BE đã chuẩn hóa 8 list endpoint trả `{ data: T[], meta: PaginationMeta }`. FE cần update toàn bộ stack (types → api-client → hooks → screens) để đọc đúng contract.

## Context

- BE branch: `codex/api-contract-pagination` (56/56 tests pass, build pass)
- Thay đổi chính: list API thêm `meta: { page, limit, total, totalPages }`
- Breaking changes: checklist list bỏ nested sections/items; audit-plan list bỏ nested assignments
- Handoff date: 2026-05-14

## Phases

| # | Phase | Status | Files chính |
|---|-------|--------|-------------|
| 1 | [Foundation — Types + API Client](phase-01-foundation-types-api-client.md) | ✅ done | `shared/types/index.ts`, `lib/api-client.ts` |
| 2 | [API Layer — 8 Endpoint Functions](phase-02-api-layer.md) | ✅ done | `audit.api.ts`, `action-plan.api.ts`, `master.api.ts`, `checklist.api.ts`, `criteria.api.ts` |
| 3 | [Hooks — 8 List Hooks](phase-03-hooks.md) | ✅ done | `use-audits`, `use-action-plans`, `use-audit-plans`, `use-stores`, `use-users`, `use-brands`, `use-checklists`, `use-criteria` |
| 4 | [Screens — 7 List Screens](phase-04-screens.md) | ✅ done | audits, action-plan, audit-plans, locations, users, checklists, criteria pages |
| 5 | [Pagination UI Component](phase-05-pagination-ui.md) | ✅ done | `shared/components/pagination-controls.tsx` |
| 6 | [Consolidate Org + Locations](phase-06-consolidate-org-locations.md) | ✅ done | `organization/page.tsx`, `locations/page.tsx`, `app-sidebar.tsx` |

## Dependency Order

```
Phase 1 (types + client) → Phase 2 (API) → Phase 3 (hooks) → Phase 4 (screens) + Phase 5 (UI)
Phase 4 & 5 có thể làm song song
```

## Critical Notes

- `apiClient.get<T[]>()` hiện trả `T[]` (strip meta). Cần thêm `apiClient.list<T>()` trả `{ data: T[], meta }` — KHÔNG sửa `get()` vì sẽ break mutation endpoints
- Checklist list: FE không được đọc `.sections` từ list response nữa — phải gọi detail route
- Audit-plan list: FE không được đọc `.assignments` từ list response nữa — phải gọi detail route
- `meta.total` thay thế `data.length` cho tổng record count
- Text search (free-text) vẫn client-side vì BE chưa có search param
- Status filter action-plan → server-side (BE hỗ trợ `?status=`)
- `storeId`, `brandId`, `isActive`, `groupId` filter → server-side
