# Phase 01 — Fix QC routing & sidebar

## Context links
- Root plan: [plan.md](./plan.md)
- Auth store: `src/stores/auth.store.ts`
- Sidebar: `src/shared/components/app-sidebar.tsx`
- Dashboard redirect: `src/app/(dashboard)/dashboard/page.tsx`
- Login form: `src/features/auth/components/login-form.tsx`

## Overview
- **Priority:** P1 (blocker — QC không vào được trang đúng)
- **Status:** pending
- **Effort:** ~20m
- **Mô tả:** Sau khi login với role `qc_auditor`, hệ thống đang push tới `/master-data/organization` (admin landing). QC phải về `/qc/my-assignments`. Sidebar QC hiện chỉ có 1 menu "Lịch kiểm tra" — bổ sung group + link đúng cho QC workflow.

## Key insights
- Redirect cứng `router.push("/master-data/organization")` ở 2 nơi: `login-form.tsx:33` + `dashboard/page.tsx:5`.
- Auth store đã có `activeRole` (Zustand persist key `maycha_auth`). Sau `setAuth`, có thể đọc trực tiếp.
- Sidebar có map `NAV_BY_ROLE` — chỉ cần extend `QC_NAV`.
- Header logo `<Link href="/master-data/organization">` cũng cần đổi theo role (hoặc về `/` để layout tự redirect).

## Requirements

### Functional
- Login `qc_auditor` → redirect `/qc/my-assignments`.
- Login role khác giữ nguyên (admin/QAM → `/master-data/organization`, AM/SM/EV → `/master-data/organization` cho tới khi có dashboard riêng).
- `/dashboard` redirect theo role thay vì cứng.
- Sidebar QC group "Công việc của tôi" có:
  - Lịch kiểm tra → `/qc/my-assignments` (sẵn sàng)
  - Kết quả kiểm tra → `/qc/results` (placeholder route — Phase ngoài plan)
  - Action Plan của cửa hàng → `/qc/action-plans` (placeholder)
- Header logo link → role-aware (về landing của role đó).

### Non-functional
- DRY: tách helper `getLandingPathByRole(roleKey)` ở `src/lib/roles.ts`.
- KISS: không build full dashboard QC trong phase này; route "Kết quả" + "Action Plan" tạm thời point tới `/qc/my-assignments` nếu chưa có page → confirm với user trước khi mở placeholder (xem Unresolved Q1 ở `plan.md`).

## Architecture
```
login-form.tsx                roles.ts
   |                            |
   onSuccess → useAuthStore     getLandingPathByRole(role)
   |
   router.push(landing)
                                ↑
dashboard/page.tsx (redirect) ──┘
                                ↑
app-sidebar.tsx (logo href) ────┘
```

## Related code files

### Modify
- `src/lib/roles.ts` — add `getLandingPathByRole(role)` helper.
- `src/features/auth/components/login-form.tsx` — đọc `activeRole` từ store sau `login`, push theo helper.
- `src/app/(dashboard)/dashboard/page.tsx` — convert to client component đọc auth store → redirect.
- `src/shared/components/app-sidebar.tsx` — extend `QC_NAV`, header link dùng helper.

### Create
- (None)

### Delete
- (None)

## Implementation steps

1. **Add helper** trong `src/lib/roles.ts`:
   ```ts
   export const LANDING_BY_ROLE: Record<RoleKey, string> = {
     company_admin: "/master-data/organization",
     qa_manager: "/master-data/organization",
     qc_auditor: "/qc/my-assignments",
     am: "/master-data/organization",
     store_manager: "/master-data/organization",
     executive_viewer: "/master-data/organization",
   };
   export function getLandingPathByRole(role: RoleKey | null): string {
     return role ? LANDING_BY_ROLE[role] ?? "/master-data/organization" : "/login";
   }
   ```

2. **Fix login redirect** (`login-form.tsx`):
   - Import `useAuthStore` + `getLandingPathByRole`.
   - Trong `onSuccess`, đọc `useAuthStore.getState().activeRole` (login hook đã set xong).
   - `router.push(getLandingPathByRole(activeRole))`.

3. **Fix dashboard redirect** (`dashboard/page.tsx`):
   - Convert thành `"use client"` + `useEffect(() => router.replace(landing))`.
   - Trả về spinner trong lúc redirect.

4. **Extend QC nav** (`app-sidebar.tsx`):
   ```ts
   const QC_NAV: NavGroup[] = [
     {
       label: "Công việc của tôi",
       items: [
         { title: "Lịch kiểm tra", url: "/qc/my-assignments", icon: ClipboardList },
         { title: "Kết quả kiểm tra", url: "/qc/results", icon: BarChart3 },
         { title: "Action Plan", url: "/qc/action-plans", icon: ListChecks },
       ],
     },
   ];
   ```
   - Import thêm `BarChart3`, `ListChecks` từ `lucide-react`.
   - Header logo: `<Link href={getLandingPathByRole(roleKey)} …>`.

5. **Typecheck** `npm run typecheck`.

6. **Manual test:**
   - Login QC → đúng `/qc/my-assignments`.
   - Click logo → quay về `/qc/my-assignments`.
   - Login QAM → giữ `/master-data/organization`.

## Todo list
- [ ] Add `getLandingPathByRole` + `LANDING_BY_ROLE` ở `src/lib/roles.ts`
- [ ] Sửa `login-form.tsx` dùng helper
- [ ] Sửa `dashboard/page.tsx` client redirect theo role
- [ ] Extend `QC_NAV` (3 menu items) + sửa header link
- [ ] `npm run typecheck` pass
- [ ] Manual smoke test 2 role (QC + QAM)

## Success criteria
- Login QC vào thẳng `/qc/my-assignments`.
- Sidebar QC hiển thị 3 menu items đúng group label.
- Không bị infinite redirect.
- Typecheck pass.

## Risk assessment
| Risk | Mitigation |
|------|------------|
| Login hook set `activeRole` async, `onSuccess` đọc store chưa kịp | Đọc qua `getState()` sau khi login mutation đã set, hoặc lấy từ login response trả về |
| Placeholder route `/qc/results`, `/qc/action-plans` 404 | Confirm user trước khi build (Unresolved Q1). Nếu defer → bỏ tạm 2 menu, chỉ giữ "Lịch kiểm tra" |
| Header logo redirect khi chưa có role (SSR) | Fallback về `/login` |

## Security considerations
- Không expose role logic mới — chỉ là client redirect. RoleGuard hiện hữu vẫn bảo vệ page level.

## Next steps
- Sau khi phase 01 xong → Phase 02 (execute page layout).
