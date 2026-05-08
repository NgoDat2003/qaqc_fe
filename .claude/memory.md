# Project Memory — QA/QC Frontend
> Session mới đọc file này đầu tiên để nắm nhanh trạng thái dự án.

> ⚠️ **Lưu ý:** Thông tin nghiệp vụ MayCha (số cửa hàng, roles, scoring rules, luồng xử lý)
> có thể thay đổi. Source of truth luôn là:
> `d:\work\maycha\.claude\projects\qaqc-platform\context\02_qaqc_platform.md`
> Không tự suy diễn — đọc file đó khi cần xác nhận nghiệp vụ.

---

## Dự án là gì

Web app số hóa quy trình kiểm tra chất lượng chuỗi trà sữa MayCha.
Thay thế Google Form + Excel. Production target Phase 1: **13/05/2026**.

**Luồng nghiệp vụ:**
```
QAM tạo criteria → build checklist → lập audit plan → gán QC
→ QC đến quán audit → submit → SM tạo action plan → QAM close
```

---

## Trạng thái hiện tại

**Branch:** `feat/wire-users-api` — đã commit, sẵn sàng merge vào main
**Build:** TypeScript ✅ | Tests 58/58 ✅

**Đã xong (tích lũy):**
- ✅ Base cleanup, fix any types, ESLint no-any rule
- ✅ Login page redesign, DataTable component, responsive tables
- ✅ Shared Component Library — 11 components (StatusBadge, MetricCard, SearchInput, ConfirmDialog, RowActions, FormDrawer, DataTable, EmptyState, PageHeader, ScoreBadge, app-sidebar)
- ✅ Tests 58/58 (sidebar, role-guard, score-badge, confirm-dialog)
- ✅ **Slice 2 hoàn thành — Wire Users API**
  - `/master-data/users` — useUsers/useCreateUser/useUpdateUser/useToggleUserActive + DataTable + SearchInput + RowActions
  - `/settings/users` — useUsers/useCreateUser/useUpdateUser + DataTable + SearchInput + RowActions
  - Export `UserFormValues` từ user-drawer.tsx
  - Thêm `User.title?` vào shared types
  - `RoleAssignment.store?` — chờ BE implement (hiện ScopeTag fallback về storeId CUID)

**Chưa làm — cần làm tiếp (theo thứ tự ưu tiên):**

### 1. Fix auth init
- Cookie `qo_token` hết hạn nhưng `isAuthenticated: true` trong localStorage
- Dashboard layout đã có `useMe()` — cần verify flow đúng

### 2. Slice 3 — Criteria & Checklist (QAM flow)
- Wire criteria API — groups + criteria library (pages + API đã có)
- Checklist builder: verify hoạt động với real API

### 3. Slice 5 — Audit Execute (QC flow) ⭐ ưu tiên cao
- Mobile-first, evidence upload
- Wire `useAuditExecute`

### 4. Dashboard pages (6 roles)
- Đang là stub — wire real API

### 5. BE task (thông báo team)
- `GET /users` cần include `store: { id, name, code }` trong từng `RoleAssignment`

---

## Codebase map

```
src/
├── app/
│   ├── (auth)/login/         ← Login page
│   └── (dashboard)/          ← Protected routes (sidebar + header)
│       ├── dashboard/
│       ├── master-data/      ← organization, users, import, locations (⚠️ mock data)
│       └── operations/       ← criteria, checklists, audit-plans, audits, my-audits, action-plan, reports
├── features/                 ← Feature modules (api + hooks + components)
│   ├── auth/                 ← login, me, logout
│   ├── master-data/          ← brands, stores, users
│   ├── criteria/             ← groups + criteria library
│   ├── checklist/            ← checklist builder
│   ├── audit/                ← execution + results + plans
│   ├── action-plan/          ← SM tạo AP, QAM close
│   └── dashboard/            ← 6 dashboard theo role
├── components/
│   └── ui/                   ← shadcn primitives ONLY (KHÔNG sửa)
├── shared/
│   ├── types/index.ts        ← SOURCE OF TRUTH — không xóa field (có ScoreGrade, RoleKey)
│   └── components/           ← 11 components: PageHeader, DataTable, EmptyState, RoleGuard,
│                                ScoreBadge, StatusBadge, MetricCard, SearchInput,
│                                ConfirmDialog, RowActions, FormDrawer + app-sidebar
├── lib/
│   ├── api-client.ts         ← mọi API call đi qua đây
│   ├── scoring.ts            ← tính điểm audit
│   ├── roles.ts              ← role helpers
│   └── format.ts             ← date, number formatting
└── stores/
    ├── auth.store.ts         ← Zustand persist: user, activeRole
    └── ui.store.ts
```

---

## Key patterns

**API call:**
```ts
// ✅ Đúng
import { apiClient } from "@/lib/api-client"
const data = await apiClient.get<Brand[]>("/brands")

// ❌ Sai — không dùng fetch trực tiếp
```

**Upload file:**
```ts
// ✅ Đúng — fetch trực tiếp, KHÔNG set Content-Type
import { uploadApi } from "@/shared/api/upload.api"

// ❌ Sai — apiClient.post() sẽ JSON.stringify FormData thành {}
```

**Auth store:**
```ts
const { user, activeRole, setAuth, logout } = useAuthStore()
// activeRole: "company_admin" | "qa_manager" | "qc_auditor" | "am" | "store_manager" | "executive_viewer"
```

**Scoring logic:**
- C(30%) + H(15%) + P(15%) + E(40%)
- CCP: flag="critical", lỗi ≥ threshold → nhóm đó về 0
- RISK: flag="risk" triggered → toàn bài về 0

---

## Decisions đã làm

| Decision | Lý do |
|----------|-------|
| Upload dùng fetch trực tiếp | apiClient.post() JSON.stringify FormData = empty |
| Zustand persist cho auth | Giữ session qua refresh, tránh flash |
| TanStack Query cho server state | Cache + refetch tự động |
| Feature-based architecture | Mỗi feature độc lập, dễ parallel work |
| MSW cho test | Mock API ở network level, không mock module |
| ScoreGrade type → shared/types/index.ts | Single source of truth, xóa duplicate components/shared/ |
| app-sidebar → shared/components/ | Shared across all roles, không phải shadcn primitive |
| Drawers → features/master-data/components/ | Feature-specific, không shared |
| z.string() thay vì z.enum() cho role field | z.enum() + zodResolver gây generic type conflict với RHF v7 |

---

## Failed approaches (đừng thử lại)

- `apiClient.post()` để upload file → JSON.stringify(FormData) = `{}`
- Chạy test mà không mock `next/navigation` → crash vì không có router context
- Xóa file mà không grep imports trước → có thể break build

---

## Next tasks (thứ tự ưu tiên)

1. **Fix auth init** — expired token flow (`qo_token` hết hạn nhưng localStorage vẫn authenticated)
2. **Slice 3** — QAM Criteria wire API (groups + criteria library pages)
3. **Slice 5** — QC Execute mobile-first (ưu tiên cao nhất về nghiệp vụ)
4. **Dashboard** — wire KPI data thật cho 6 roles
5. **BE task** — `GET /users` include `store: { id, name, code }` trong RoleAssignment
