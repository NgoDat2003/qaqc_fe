---
title: BE Handoff — UI Alignment (Admin module)
status: in_progress
priority: critical
created: 2026-05-15
branch: dev
source: D:/work/maycha/qaqc-build/qaqc-be/docs/admin-fe-handoff.md
blockedBy: []
blocks: []
---

# BE Handoff — UI Alignment

Cập nhật FE để khớp với BE thực tế sau khi chuyển sang Supabase Singapore.

## Nguồn: `admin-fe-handoff.md` — Key differences

| # | Điểm thay đổi | Ảnh hưởng |
|---|--------------|-----------|
| 1 | Error shape: `{ error: { statusCode, message } }` | `api-client.ts` cần verify/fix |
| 2 | `GET /brands` trả `_count.stores` | Brand table + Type cần update |
| 3 | `GET /users` — roleAssignments có `store: { id, code, name }` | User table hiện role+store, Type update |
| 4 | `POST /brands` chỉ nhận `code`, `name` (không `isActive`) | BrandDrawer create |
| 5 | `PATCH /brands/[id]` không cho sửa `code` | BrandDrawer edit → disable code |
| 6 | `POST /stores` không có `isActive` field | StoreDrawer create payload |
| 7 | `POST /users` — store_manager phải có storeId | UserDrawer validation |

## Files cần sửa

| File | Sửa gì |
|------|--------|
| `src/shared/types/index.ts` | `Brand._count`, `RoleAssignment.store` |
| `src/lib/api-client.ts` | Verify error parsing với new shape |
| `src/features/master-data/components/brand-drawer.tsx` | Disable code khi edit, bỏ isActive khỏi POST |
| `src/features/master-data/components/store-drawer.tsx` | Bỏ isActive khỏi POST payload |
| `src/app/(dashboard)/master-data/organization/page.tsx` | Brand table: thêm cột "# CH", dùng brand._count.stores |
| `src/app/(dashboard)/master-data/users/page.tsx` | User table: hiện role + store.name |

## Phases

| Phase | Nội dung | Effort |
|-------|---------|--------|
| [Phase 1](phase-01-types-api.md) | Types + api-client error fix | 10 min |
| [Phase 2](phase-02-brand-drawer.md) | BrandDrawer: disable code edit, fix POST payload | 10 min |
| [Phase 3](phase-03-store-drawer.md) | StoreDrawer: fix POST payload | 5 min |
| [Phase 4](phase-04-tables-display.md) | Brand table + User table display | 15 min |

## Success Criteria

- [ ] `Brand._count.stores` hiện trong bảng thương hiệu
- [ ] Brand code field disabled khi edit (không cho sửa)
- [ ] User table hiện "Role — Tên cửa hàng" thay vì chỉ role
- [ ] Error messages từ BE hiển thị đúng (không phải "[object Object]")
- [ ] typecheck clean, 81 tests pass
