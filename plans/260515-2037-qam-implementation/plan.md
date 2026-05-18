---
title: QA Manager (QAM) Role — Full Implementation
status: in_progress
priority: critical
created: 2026-05-15
branch: dev
source: D:/work/maycha/qaqc-build/qaqc-be/docs/qam-fe-handoff.md
blockedBy: []
blocks: []
---

# QAM Role — Implementation Plan

## BE API Evaluation

### APIs đã có ✅
| Group | Endpoints |
|-------|-----------|
| Criteria Groups | GET, POST, PATCH |
| Criteria | GET (filter groupId/isActive), POST, PATCH |
| Checklists | GET list, POST, GET detail, PATCH, publish, archive |
| Checklist sections | POST add, PATCH update |
| Section items | POST add |
| Audit Plans | GET list, POST create, GET detail, POST close |
| QC My Assignments | GET (qc_auditor only) |

### Gaps cần yêu cầu BE bổ sung ⚠️
| Endpoint thiếu | Tác động | Priority |
|----------------|---------|----------|
| `DELETE /api/checklists/:id/sections/:sectionId` | Không thể xóa section khỏi draft | HIGH |
| `DELETE /api/checklists/:id/sections/:sectionId/items/:itemId` | Không thể xóa criteria khỏi section | HIGH |
| `GET /api/criteria/:id` | Không có detail view đơn lẻ | LOW |
| `DELETE /api/criteria-groups/:id` | Không có xóa (chỉ toggle inactive) | LOW — acceptable |

**→ Cần yêu cầu BE thêm 2 DELETE endpoints trước khi implement Checklist Builder.**

### Thiết kế cần chú ý
- `CriteriaGroup.code` và `Criteria.code`: immutable sau khi tạo (PATCH không accept code)
- `ChecklistSection.weight`: tổng phải = 100 trước khi publish (validation cả client + server)
- Audit plan dùng contract mới `assignments[]` (không phải `stores[] + auditorId`)
- All lists: full array, FE tự sort/filter

## Screens cần triển khai

| Screen | Route | Role |
|--------|-------|------|
| Criteria Groups | `/qam/criteria-groups` | QAM, CA |
| Criteria Library | `/qam/criteria` | QAM, CA |
| Checklists list | `/qam/checklists` | QAM, CA |
| Checklist Builder | `/qam/checklists/[id]` | QAM, CA |
| Audit Plans list | `/qam/audit-plans` | QAM, CA |
| Audit Plan create | `/qam/audit-plans/new` | QAM, CA |
| My Assignments | `/qc/my-assignments` | QC Auditor |

## Phases

| Phase | Nội dung | Effort |
|-------|---------|--------|
| [Phase 0](phase-00-types-api-hooks.md) | Types + API layer + Hooks cho tất cả QAM domains | 45 min |
| [Phase 1](phase-01-sidebar-routing.md) | Sidebar QAM menu + route files + layout | 20 min |
| [Phase 2](phase-02-criteria-groups.md) | Criteria Groups page (CRUD + SortableTable) | 30 min |
| [Phase 3](phase-03-criteria.md) | Criteria page (CRUD + group filter + flag indicator) | 30 min |
| [Phase 4](phase-04-checklists.md) | Checklists list + create | 20 min |
| [Phase 5](phase-05-checklist-builder.md) | Checklist Builder (sections + items + weight + publish) ⭐ | 60 min |
| [Phase 6](phase-06-audit-plans.md) | Audit Plans list + create (multi-assignment) | 45 min |

**Depends on:** BE thêm DELETE section/item endpoints trước Phase 5

## Shared Infrastructure cần thêm

**Types** (`src/shared/types/index.ts`):
- `CriteriaGroup` — thêm `isActive`, `color`
- `Criteria` — thêm `group` relation
- `ChecklistSummary` (list item với `_count`)
- `ChecklistDetail` (full nested)
- `AuditPlanFull` (với assignments + progress)

**Feature directories** (cần tạo lại):
- `src/features/criteria/` — api, hooks, components
- `src/features/checklist/` — api, hooks, components
- `src/features/audit/` — api, hooks, components

## Definition of Done

- [ ] QAM đăng nhập → thấy menu Thiết lập chất lượng trong sidebar
- [ ] Criteria Groups: CRUD, toggle active
- [ ] Criteria: CRUD, filter by group, flag indicator (none/critical/risk)
- [ ] Checklists list: filter by status, create draft
- [ ] Checklist Builder: add section (chọn group + weight), add criteria vào section, weight sum indicator, publish
- [ ] Audit Plans: list với progress bars, create với multi-store assignments
- [ ] `npm run typecheck` clean
- [ ] `npm run test -- --run` pass
