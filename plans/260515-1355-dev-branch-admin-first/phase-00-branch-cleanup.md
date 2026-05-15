# Phase 0 — Tạo Branch Dev + Cleanup

**Effort:** 15 min
**Mục tiêu:** Branch `dev` sạch, chỉ còn admin-relevant code, `npm run dev` không lỗi

---

## Bước 1 — Tạo branch

```bash
git checkout main
git pull origin main
git checkout -b dev
```

## Bước 2 — Xóa routes không cần

```bash
# Xóa toàn bộ operations routes
rm -rf src/app/\(dashboard\)/operations
rm -rf src/app/\(dashboard\)/dashboard
rm -rf src/app/\(dashboard\)/settings
```

## Bước 3 — Xóa features không cần

```bash
rm -rf src/features/criteria
rm -rf src/features/checklist
rm -rf src/features/audit
rm -rf src/features/action-plan
rm -rf src/features/analytics
```

## Bước 4 — Xóa files lẻ

```bash
# Region drawer không dùng
rm src/features/master-data/components/region-drawer.tsx

# E2E tests (viết lại sau)
rm -rf e2e

# Test handlers không còn features
rm -rf src/test/handlers
```

## Bước 5 — Cập nhật Sidebar

**File:** `src/shared/components/app-sidebar.tsx`

Giữ lại chỉ 2 menu item cho admin:
- **Tổ chức** → `/master-data/organization`
- **Người dùng** → `/master-data/users`

Xóa toàn bộ menu items trỏ đến `/operations/*`, `/dashboard`, `/reports`.

## Bước 6 — Xóa imports lỗi

Sau khi xóa features, chạy `npm run typecheck` để tìm broken imports. Fix từng cái một.

Thường xảy ra ở:
- `src/shared/components/app-sidebar.tsx` — nếu import từ features đã xóa
- `src/shared/types/index.ts` — không cần sửa (chỉ thêm, không xóa)
- `src/features/master-data/index.ts` — xóa re-exports của components đã xóa

## Bước 7 — Verify

```bash
npm run typecheck   # phải pass
npm run dev         # phải start không lỗi
```

Truy cập `http://localhost:3001`:
- Login → redirect đúng
- Sidebar chỉ hiện 2 menu: Tổ chức + Người dùng
- Organization page load không crash

## Checklist

- [ ] Branch `dev` tạo từ `main`
- [ ] `src/app/(dashboard)/operations/` đã xóa
- [ ] `src/app/(dashboard)/dashboard/` đã xóa
- [ ] `src/features/criteria|checklist|audit|action-plan|analytics` đã xóa
- [ ] Sidebar chỉ còn admin menus
- [ ] `npm run typecheck` pass
- [ ] `npm run dev` start không lỗi
