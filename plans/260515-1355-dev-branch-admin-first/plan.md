---
title: Dev Branch — Admin Role First (Clean Slate)
status: in_progress
priority: critical
created: 2026-05-15
branch: dev
blockedBy: []
blocks: []
---

# Dev Branch — Admin Role First

Tạo branch `dev` từ `main`, xóa sạch toàn bộ non-admin code, rebuild đúng từng tính năng admin.

## Quyết định chiến lược

- **Main branch:** Giữ nguyên — không đụng
- **Dev branch:** Làm việc từ đây trở đi
- **Nguyên tắc:** Mỗi tính năng PHẢI hoạt động đúng 100% trước khi sang tính năng tiếp theo
- **Thứ tự:** Admin role → sau đó mới sang các role khác

## Scope — Admin Role (company_admin)

| Trang | Tính năng |
|-------|-----------|
| Organization | Brand CRUD + Store CRUD đầy đủ, đúng |
| Users | User CRUD + role assignment đầy đủ, đúng |

Chỉ 2 trang này. Không làm gì thêm cho đến khi xong.

## Giữ lại

- `src/lib/` — api-client, build-qs, format, roles, scoring, utils
- `src/shared/` — types/index.ts, tất cả shared components
- `src/components/ui/` — shadcn primitives (21 components)
- `src/stores/` — auth.store.ts, ui.store.ts
- `src/app/(auth)/login/` — trang login
- `src/app/(dashboard)/layout.tsx` — sidebar + header layout
- `src/features/auth/` — login API + hooks
- `src/features/master-data/` — **rebuild đúng** từ đây

## Xóa sạch

- `src/app/(dashboard)/operations/` — toàn bộ (criteria, checklist, audit, action-plan, reports, my-audits)
- `src/app/(dashboard)/dashboard/` — role dashboards
- `src/app/(dashboard)/settings/` — duplicate users page
- `src/features/criteria/`
- `src/features/checklist/`
- `src/features/audit/`
- `src/features/action-plan/`
- `src/features/analytics/`
- `src/features/master-data/components/region-drawer.tsx` — không cần
- `e2e/` — xóa hết, viết lại sau
- `src/test/handlers/` — xóa handlers không liên quan

## Phases

| Phase | Mô tả | Files | Effort |
|-------|-------|-------|--------|
| [Phase 0](phase-00-branch-cleanup.md) | Tạo branch dev + xóa non-admin code | Multiple | 15 min |
| [Phase 1](phase-01-be-fixes.md) | BE: search + role filter (gửi Codex) | qaqc-be | 20 min |
| [Phase 2](phase-02-store-drawer.md) | StoreDrawer: rebuild đúng hoàn toàn | store-drawer.tsx + hooks | 45 min |
| [Phase 3](phase-03-brand-drawer.md) | BrandDrawer: polish + đồng nhất design | brand-drawer.tsx | 15 min |
| [Phase 4](phase-04-organization-page.md) | Organization page: wire đúng actions, toggle active | organization/page.tsx | 20 min |
| [Phase 5](phase-05-users-page.md) | Users page: review + fix nếu có vấn đề | users/page.tsx | 30 min |

## Definition of Done

- [ ] `npm run dev` khởi động không lỗi
- [ ] Login → redirect đúng trang admin
- [ ] Tạo Brand → form đúng, save thành công, list update
- [ ] Sửa Brand → pre-fill đúng, save thành công
- [ ] Toggle Brand active/inactive → hoạt động
- [ ] Tạo Store → brand dropdown hiện tên (không phải ID), region/province có data, manager load đúng
- [ ] Sửa Store → pre-fill đúng tất cả fields
- [ ] Toggle Store active/inactive → hoạt động
- [ ] Search store → tìm trên toàn bộ dataset
- [ ] Filter store theo brand → đúng
- [ ] Tạo User + gán role → hoạt động
- [ ] `npm run typecheck` — clean
