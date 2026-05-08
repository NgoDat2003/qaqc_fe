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

**Branch:** `feat/shared-component-library` — sẵn sàng commit & merge
**Build:** TypeScript ✅ | Tests 58/58 ✅ | Lint (new files) ✅

**Đã xong (các sessions trước):**
- ✅ Base cleanup, fix any types, ESLint no-any rule
- ✅ Login page redesign, DataTable component, responsive tables
- ✅ Workflow rules, agent permissions, gitignore worktrees
- ✅ Test RTL app-sidebar (5 tests), E2E base

**Đã xong (session này — branch feat/shared-component-library):**
- ✅ **Shared Component Library** — 6 components mới: StatusBadge, MetricCard, SearchInput, ConfirmDialog, RowActions, FormDrawer
- ✅ **Structure refactor** — `src/components/` chỉ còn `ui/`; drawers → `features/master-data/components/`; app-sidebar → `shared/components/`
- ✅ **Tests mới** — score-badge.test.tsx (26 cases), role-guard.test.tsx, confirm-dialog.test.tsx → tổng 58/58
- ✅ **Barrel export** — `src/shared/components/index.ts` export 11 components
- ✅ **ScoreGrade type** — thêm vào `shared/types/index.ts` làm single source of truth
- ✅ **RoleKey** — xóa duplicate khỏi app-sidebar, import từ `shared/types`
- ✅ **Bug fixes** — store-drawer type enum, district field, ChevronDown any, role values, isLoading guards, Invalid Date, PII log

**Chưa làm — cần làm tiếp (theo thứ tự ưu tiên):**

### 1. Wire Users API ⭐ tiếp theo
- `src/app/(dashboard)/master-data/users/page.tsx` — còn mock data `USERS_MOCK`
- `src/app/(dashboard)/settings/users/page.tsx` — còn mock data
- Hook đã có: `useUsers()` trong `src/features/master-data/hooks/use-users.ts`

### 2. Fix auth init
- Cookie `qo_token` hết hạn nhưng `isAuthenticated: true` trong localStorage
- Dashboard layout đã có `useMe()` — cần verify flow đúng

### 3. Slice 3 — Criteria & Checklist (QAM flow)
- Wire criteria API — groups + criteria library (pages + API đã có)
- Checklist builder: verify hoạt động với real API

### 4. Slice 5 — Audit Execute (QC flow) ⭐ ưu tiên cao
- Mobile-first, evidence upload
- Wire `useAuditExecute`

### 5. Dashboard pages (6 roles)
- Đang là stub — wire real API

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

1. **Wire Users API** — thay `USERS_MOCK` bằng `useUsers()` hook thật (Slice 2)
2. **Fix auth init** — expired token flow
3. **Slice 3** — QAM Criteria wire API
4. **Slice 5** — QC Execute mobile-first (ưu tiên cao nhất về nghiệp vụ)
