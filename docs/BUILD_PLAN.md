# BUILD PLAN — Maycha QA/QC Frontend
> Mỗi task = 1 file cụ thể. Check off khi done.

---

## PHASE 0 — Foundation (Không có UI, chạy trước mọi thứ)

### 0.1 Config & Env
- [ ] `next.config.ts` — thêm `NEXT_PUBLIC_BE_URL`, image domains (MinIO host)
- [ ] `.env.local` — `NEXT_PUBLIC_BE_URL=http://localhost:3000`
- [ ] `src/middleware.ts` — protect `/(dashboard)/**`, redirect `/login` nếu không có cookie

### 0.2 Design Tokens
- [ ] `src/app/globals.css` — CSS variables: primary, success, danger, warning, info, grade colors (excellent/good/pass/fail/alarm)

### 0.3 Types
- [ ] `src/shared/types/index.ts` — đầy đủ: AuthUser, Brand, Store, User, Criteria, ChecklistForm, AuditPlan, Audit, Violation, ActionPlan, Notification, ApiResponse

### 0.4 API Layer
- [ ] `src/lib/api-client.ts` — get/post/patch/put/delete + 401 redirect
- [ ] `src/shared/api/upload.api.ts` — `uploadEvidence(file): Promise<{url}>`

### 0.5 Stores
- [ ] `src/stores/auth.store.ts` — user, activeRole, setUser, logout
- [ ] `src/stores/ui.store.ts` — sidebarOpen, toggle

### 0.6 Providers & Layout Shell
- [ ] `src/app/providers.tsx` — QueryClientProvider + Toaster
- [ ] `src/app/layout.tsx` — wrap providers, font, metadata
- [ ] `src/app/(auth)/layout.tsx` — layout trang login (centered, no sidebar)
- [ ] `src/app/(dashboard)/layout.tsx` — sidebar + header + main content

### 0.7 Lib Utils
- [ ] `src/lib/utils.ts` — `cn()` utility
- [ ] `src/lib/scoring.ts` — `calculateGroupScore()`, `calculateFinalScore()`, `determineGrade()`
- [ ] `src/lib/format.ts` — `formatDate()`, `formatScore()`, `formatGrade()`
- [ ] `src/lib/roles.ts` — `hasRole(role)`, `getRoleLabel(roleKey)`

---

## PHASE 1 — Shared Components (Dùng ở mọi screen)

### 1.1 shadcn/ui primitives (cài bằng CLI nếu chưa có)
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/textarea.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] `src/components/ui/checkbox.tsx`
- [ ] `src/components/ui/badge.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/sheet.tsx`
- [ ] `src/components/ui/table.tsx`
- [ ] `src/components/ui/tabs.tsx`
- [ ] `src/components/ui/skeleton.tsx`
- [ ] `src/components/ui/progress.tsx`
- [ ] `src/components/ui/scroll-area.tsx`
- [ ] `src/components/ui/tooltip.tsx`
- [ ] `src/components/ui/dropdown-menu.tsx`
- [ ] `src/components/ui/separator.tsx`
- [ ] `src/components/ui/switch.tsx`
- [ ] `src/components/ui/label.tsx`
- [ ] `src/components/ui/form.tsx`

### 1.2 Shared custom components
- [ ] `src/components/shared/page-header.tsx` — title + description + slot action
- [ ] `src/components/shared/data-table.tsx` — table + search input + loading skeleton rows
- [ ] `src/components/shared/empty-state.tsx` — icon + message + optional CTA button
- [ ] `src/components/shared/score-badge.tsx` — số điểm + màu theo grade
- [ ] `src/components/shared/grade-badge.tsx` — text Xuất sắc/Tốt/Đạt/Không đạt/Báo động
- [ ] `src/components/shared/role-guard.tsx` — `<RoleGuard allowedRoles={[...]}>`
- [ ] `src/components/shared/confirm-dialog.tsx` — title + message + confirm/cancel
- [ ] `src/components/shared/file-uploader.tsx` — input[type=file] + preview ảnh + remove

### 1.3 Layout components
- [ ] `src/components/app-sidebar.tsx` — nav links filter theo activeRole
- [ ] `src/components/app-header.tsx` — breadcrumb + notification bell + user dropdown

---

## PHASE 2 — Feature: Auth

### 2.1 API + Hooks
- [ ] `src/features/auth/api/auth.api.ts` — `login()`, `me()`, `logout()`
- [ ] `src/features/auth/hooks/use-login.ts` — useMutation
- [ ] `src/features/auth/hooks/use-me.ts` — useQuery (bootstrap)
- [ ] `src/features/auth/index.ts` — re-export

### 2.2 UI
- [ ] `src/app/(auth)/login/page.tsx` — form email + password, submit gọi useLogin, redirect dashboard

---

## PHASE 3 — Feature: Master Data

### 3.1 API + Hooks
- [ ] `src/features/master-data/api/master.api.ts`
  - `getOrganization()`, `updateOrganization()`
  - `getBrands()`, `createBrand()`, `updateBrand()`, `toggleBrand()`
  - `getStores()`, `createStore()`, `updateStore()`, `toggleStore()`
  - `getUsers()`, `createUser()`, `updateUser()`, `assignRoles()`
- [ ] `src/features/master-data/hooks/use-brands.ts`
- [ ] `src/features/master-data/hooks/use-stores.ts`
- [ ] `src/features/master-data/hooks/use-users.ts`
- [ ] `src/features/master-data/index.ts`

### 3.2 Components (Drawers — tái dùng trong page)
- [ ] `src/components/master-data/brand-drawer.tsx` — form tạo/sửa Brand
- [ ] `src/components/master-data/store-drawer.tsx` — form tạo/sửa Store (brand, region, AM, SM)
- [ ] `src/components/master-data/user-drawer.tsx` — form tạo/sửa User + assign roles
- [ ] `src/components/master-data/region-drawer.tsx` — form tạo/sửa Region (nếu có entity này)

### 3.3 Pages
- [ ] `src/app/(dashboard)/master-data/organization/page.tsx` — xem + sửa thông tin công ty
- [ ] `src/app/(dashboard)/master-data/locations/page.tsx` — quản lý khu vực/tỉnh thành
- [ ] `src/app/(dashboard)/master-data/users/page.tsx` — table users + search + brand-drawer
- [ ] `src/app/(dashboard)/master-data/import/page.tsx` — upload Excel + preview + submit

---

## PHASE 4 — Feature: Criteria & Checklist

### 4.1 Criteria — API + Hooks
- [ ] `src/features/criteria/api/criteria.api.ts`
  - `getCriteriaGroups()`, `updateCriteriaGroup()`
  - `getCriteria(filters?)`, `createCriteria()`, `updateCriteria()`, `toggleCriteria()`
- [ ] `src/features/criteria/hooks/use-criteria-groups.ts`
- [ ] `src/features/criteria/hooks/use-criteria.ts`
- [ ] `src/features/criteria/index.ts`

### 4.2 Criteria — Components
- [ ] `src/components/operations/criteria-group-card.tsx` — card nhóm C/H/E/P + weight input
- [ ] `src/components/operations/criteria-drawer.tsx` — form tạo/sửa tiêu chí (content, deduction, Dmax, flag)

### 4.3 Criteria — Pages
- [ ] `src/app/(dashboard)/operations/criteria/groups/page.tsx` — 4 cards nhóm + sửa weight
- [ ] `src/app/(dashboard)/operations/criteria/page.tsx` — table tiêu chí + filter + criteria-drawer

### 4.4 Checklist — API + Hooks
- [ ] `src/features/checklist/api/checklist.api.ts`
  - `getChecklists(status?)`, `getChecklist(id)`
  - `createChecklist()`, `updateChecklist()`, `publishChecklist()`, `archiveChecklist()`
  - `addSection()`, `updateSection()`, `deleteSection()`, `reorderSections()`
  - `addItem()`, `deleteItem()`, `reorderItems()`
- [ ] `src/features/checklist/hooks/use-checklists.ts`
- [ ] `src/features/checklist/hooks/use-checklist-detail.ts`
- [ ] `src/features/checklist/index.ts`

### 4.5 Checklist — Components
- [ ] `src/components/operations/checklist-card.tsx` — card hiển thị checklist (tên, version, status, actions)
- [ ] `src/components/operations/section-panel.tsx` — panel section trong builder (header + item list)
- [ ] `src/components/operations/section-item-row.tsx` — 1 dòng criteria trong section (code, content, flag badge)
- [ ] `src/components/operations/add-section-dialog.tsx` — dialog chọn CriteriaGroup để thêm section
- [ ] `src/components/operations/add-item-dialog.tsx` — dialog chọn Criteria từ library để thêm vào section

### 4.6 Checklist — Pages
- [ ] `src/app/(dashboard)/operations/checklists/page.tsx` — card grid checklists + filter status
- [ ] `src/app/(dashboard)/operations/checklists/new/page.tsx` — form nhập tên → tạo → redirect builder
- [ ] `src/app/(dashboard)/operations/checklists/[id]/page.tsx` — checklist builder (section list + item list + publish)

---

## PHASE 5 — Feature: Audit Planning

### 5.1 API + Hooks
- [ ] `src/features/audit/api/audit.api.ts` (phần planning)
  - `getAuditPlans()`, `createAuditPlan(payload)`
  - `getAuditPlan(id)`, `closeAuditPlan(id)`
- [ ] `src/features/audit/hooks/use-audit-plans.ts`
- [ ] `src/features/audit/index.ts`

### 5.2 Components
- [ ] `src/components/operations/create-plan-sheet.tsx` — 3-step wizard sheet
  - Step 1: plan name + chọn checklist published
  - Step 2: chọn store → gán QC + ngày
  - Step 3: review + confirm
- [ ] `src/components/operations/plan-detail-dialog.tsx` — dialog xem assignments của 1 plan

### 5.3 Pages
- [ ] `src/app/(dashboard)/operations/audit-plans/page.tsx` — table plans + stats + new plan button
- [ ] `src/app/(dashboard)/operations/audit-plans/[id]/page.tsx` — detail page (hoặc dùng dialog)

---

## PHASE 6 — Feature: Audit Execution ⭐ Ưu tiên cao nhất

### 6.1 API + Hooks
- [ ] `src/features/audit/api/audit.api.ts` (phần execution)
  - `getMyAudits()` — QC: assignments được giao
  - `startAudit(assignmentId)` — status pending → in_progress
  - `submitAudit(assignmentId, draft: AuditDraft)` — submit bài
  - `editAudit(auditId, draft, editNote)` — sửa sau submit
- [ ] `src/features/audit/hooks/use-my-audits.ts`
- [ ] `src/features/audit/hooks/use-audit-execute.ts` — local state: violations draft, upload queue

### 6.2 Components (Mobile-first)
- [ ] `src/components/operations/execute/audit-progress-bar.tsx` — X/Y tiêu chí + % completed
- [ ] `src/components/operations/execute/section-tab-bar.tsx` — tabs [C] [H] [E] [P] scroll ngang
- [ ] `src/components/operations/execute/criteria-item-card.tsx` — 1 tiêu chí:
  - Số lỗi `[−][n][+]`
  - Lỗi lặp `[−][n][+]`
  - Flag CCP/RISK badge
  - Upload ảnh button
  - Ghi chú textarea
- [ ] `src/components/operations/execute/evidence-uploader.tsx` — camera capture + preview thumbnails + remove
- [ ] `src/components/operations/execute/submit-bar.tsx` — sticky bottom: [Lưu nháp] [Submit →]
- [ ] `src/components/operations/execute/submit-confirm-dialog.tsx` — xác nhận submit, hiện số lỗi tổng

### 6.3 Pages
- [ ] `src/app/(dashboard)/operations/my-audits/page.tsx` — card list assignments của QC
- [ ] `src/app/(dashboard)/operations/audits/[id]/execute/page.tsx` — trang điền bài chính (mobile-first)

---

## PHASE 7 — Feature: Audit Results

### 7.1 API + Hooks
- [ ] `src/features/audit/api/audit.api.ts` (phần results)
  - `getAudits(filters?)` — list tất cả audits
  - `getAudit(id)` — chi tiết + violations + groupScores
- [ ] `src/features/audit/hooks/use-audits.ts`
- [ ] `src/features/audit/hooks/use-audit-detail.ts`

### 7.2 Components
- [ ] `src/components/operations/result/score-breakdown-card.tsx` — bar mỗi nhóm C/H/E/P + điểm
- [ ] `src/components/operations/result/violation-list.tsx` — list lỗi: criteria code + nội dung + số lỗi + ảnh
- [ ] `src/components/operations/result/evidence-gallery.tsx` — grid ảnh + lightbox
- [ ] `src/components/operations/result/audit-trail-log.tsx` — lịch sử sửa bài (editNote + time)

### 7.3 Pages
- [ ] `src/app/(dashboard)/operations/audits/page.tsx` — table audits + filter (store, grade, date)
- [ ] `src/app/(dashboard)/operations/audits/[id]/page.tsx` — result detail: header + score breakdown + violations

---

## PHASE 8 — Feature: Action Plan

### 8.1 API + Hooks
- [ ] `src/features/action-plan/api/action-plan.api.ts`
  - `getActionPlans(filters?)`, `getActionPlan(id)`
  - `createActionPlan(auditId, payload)`
  - `updateActionPlan(id, payload)` — SM update
  - `closeActionPlan(id)` — QAM only
- [ ] `src/features/action-plan/hooks/use-action-plans.ts`
- [ ] `src/features/action-plan/index.ts`

### 8.2 Components
- [ ] `src/components/operations/action-plan/ap-status-badge.tsx` — draft/submitted/in_progress/closed
- [ ] `src/components/operations/action-plan/ap-violation-list.tsx` — readonly list lỗi từ audit liên quan
- [ ] `src/components/operations/action-plan/ap-form.tsx` — SM: remediation textarea + deadline picker + upload ảnh khắc phục
- [ ] `src/components/operations/action-plan/ap-review-panel.tsx` — QAM: xem AP + close button + confirm

### 8.3 Pages
- [ ] `src/app/(dashboard)/operations/action-plan/page.tsx` — table APs + filter status + role-aware columns
- [ ] `src/app/(dashboard)/operations/action-plan/[id]/page.tsx` — detail: violations + ap-form (SM) hoặc ap-review-panel (QAM)

---

## PHASE 9 — Feature: Dashboard & Reports

### 9.1 API + Hooks
- [ ] `src/features/dashboard/api/dashboard.api.ts`
  - `getDashboardStats(filters?)` — KPI numbers
  - `getScoreTrend(filters?)` — data cho line chart
  - `getGradeDistribution(filters?)` — data cho pie chart
  - `getTopViolations(filters?)` — top 5 lỗi phổ biến
- [ ] `src/features/dashboard/hooks/use-dashboard-stats.ts`
- [ ] `src/features/dashboard/index.ts`

### 9.2 Components
- [ ] `src/components/dashboard/kpi-card.tsx` — số + label + trend vs tháng trước
- [ ] `src/components/dashboard/score-trend-chart.tsx` — line chart 30 ngày (dùng recharts hoặc CSS)
- [ ] `src/components/dashboard/grade-distribution-chart.tsx` — bar/pie chart theo grade
- [ ] `src/components/dashboard/top-violations-table.tsx` — table top 5 lỗi
- [ ] `src/components/dashboard/filter-bar.tsx` — brand + region + date range picker

### 9.3 Pages
- [ ] `src/app/(dashboard)/dashboard/page.tsx` — KPI cards + charts + filter
- [ ] `src/app/(dashboard)/operations/reports/page.tsx` — table chi tiết + export Excel button

---

## PHASE 10 — Feature: Notifications & Profile

### 10.1 API + Hooks
- [ ] `src/shared/api/notifications.api.ts` — `getNotifications()`, `markAllRead()`, `markRead(id)`
- [ ] `src/hooks/use-notifications.ts`

### 10.2 Components
- [ ] `src/components/notification-bell.tsx` — bell icon + unread badge + dropdown list
- [ ] `src/components/notification-item.tsx` — title + message + time + isRead style
- [ ] `src/components/user-menu.tsx` — avatar + tên + dropdown: profile, đổi mật khẩu, logout

### 10.3 Pages
- [ ] `src/app/(dashboard)/settings/profile/page.tsx` — xem thông tin + đổi mật khẩu

---

## PHASE 11 — Hoàn thiện & Polish

### 11.1 Loading states (thêm vào từng page đã build)
- [ ] `src/app/(dashboard)/operations/audits/loading.tsx`
- [ ] `src/app/(dashboard)/operations/my-audits/loading.tsx`
- [ ] `src/app/(dashboard)/operations/audit-plans/loading.tsx`
- [ ] `src/app/(dashboard)/operations/checklists/loading.tsx`
- [ ] `src/app/(dashboard)/operations/action-plan/loading.tsx`
- [ ] `src/app/(dashboard)/dashboard/loading.tsx`

### 11.2 Error states
- [ ] `src/app/(dashboard)/error.tsx` — global error boundary cho dashboard
- [ ] `src/app/(auth)/error.tsx`

### 11.3 Not found
- [ ] `src/app/not-found.tsx`

### 11.4 Mobile audit polish
- [ ] Kiểm tra `execute/page.tsx` trên viewport 375px (iPhone SE)
- [ ] Touch target tối thiểu 44px
- [ ] Camera capture test thực trên điện thoại

---

## Thứ tự build — Rule cứng

```
Phase 0 → Phase 1 → Phase 2 → Phase 3
→ Phase 4 → Phase 5 → Phase 6 (ưu tiên)
→ Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11
```

**Không build page trước khi API hook của nó xong.**  
**Không build hook trước khi type của entity đó có trong `shared/types/index.ts`.**
