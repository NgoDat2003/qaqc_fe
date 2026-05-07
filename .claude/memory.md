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

**Đang ở:** Phase 2 → Phase 3 — UI polish + Feature development

**Đã xong (session này):**
- ✅ Base cleanup: xóa duplicate/orphan files, fix canonical paths
- ✅ Fix 13 `any` types — locations, settings/users, action-plan, audit.api.ts
- ✅ Quick wins — CHANGELOG, package.json name (`maycha-qaqc-fe`), xóa clone-website skill
- ✅ Wire locations API — brands/stores dùng real API (`useBrands`, `useStores`)
- ✅ ESLint no-any rule — `@typescript-eslint/no-explicit-any: "error"`
- ✅ Test RTL app-sidebar — 5 tests pass (QAM, QC, CA role menus)
- ✅ E2E base directory — `e2e/auth.spec.ts`
- ✅ Fix hydration — Zustand persist mismatch trong dashboard layout
- ✅ Sanitize 72 sensitive data — tên/email/SĐT/mã cửa hàng → generic placeholders
- ✅ Theme update — primary amber vibrant `oklch(0.78 0.19 83)`
- ✅ Login page redesign — full-screen split, dark left + glowing orbs, clean right
- ✅ login-form.tsx — tiếng Việt, icon prefix, fix `error as any`
- ✅ DataTable component — skeleton loading, hideOnMobile, overflow-x-auto
- ✅ Responsive tables — locations, users, settings/users
- ✅ Workflow rules — commit rule, worktree parallel rule, global CLAUDE.md
- ✅ Agent permissions — Write/Edit pre-allowed cho worktree agents
- ✅ .gitignore — thêm `.claude/worktrees/`

**Chưa làm — cần làm tiếp (theo thứ tự ưu tiên):**

### 1. Wire Users API
- `src/app/(dashboard)/master-data/users/page.tsx` — còn mock data
- `src/app/(dashboard)/settings/users/page.tsx` — còn mock data
- Hook đã có: `useUsers()`, `useCreateUser()`, `useUpdateUser()`, `useToggleUserActive()`

### 2. Fix auth init
- Cookie `qo_token` hết hạn nhưng `isAuthenticated: true` trong localStorage
- Dashboard layout đã có `useMe()` — cần verify flow hoạt động đúng
- Test: logout → reload → phải redirect login

### 3. Slice 3 — Criteria & Checklist (QAM flow)
- Wire criteria API (groups + criteria library)
- Checklist builder: verify hoạt động với real API
- Theo BUILD_PLAN.md Micro 3.x

### 4. Slice 5 — Audit Execute (QC flow) ⭐ ưu tiên cao nhất
- Mobile-first, QC dùng điện thoại
- Wire `useAuditExecute`, evidence upload
- Theo BUILD_PLAN.md Micro 5.x

### 5. Dashboard pages (6 roles)
- Các dashboard còn là stub/placeholder
- Wire real API `useDashboardStats()`

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
│   ├── ui/                   ← shadcn primitives (KHÔNG sửa)
│   ├── shared/               ← ⚠️ Chỉ còn score-badge.tsx (ScoreGrade type)
│   ├── master-data/          ← brand/store/user/region drawers (THẬT, có active imports)
│   └── app-sidebar.tsx       ← sidebar role-aware (cần viết test)
├── shared/
│   ├── types/index.ts        ← SOURCE OF TRUTH — không xóa field
│   └── components/           ← page-header, role-guard, data-table, empty-state, score-badge
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
| Giữ score-badge.tsx trong src/components/shared/ | format.ts import ScoreGrade type từ đây |

---

## Failed approaches (đừng thử lại)

- `apiClient.post()` để upload file → JSON.stringify(FormData) = `{}`
- Chạy test mà không mock `next/navigation` → crash vì không có router context
- Xóa file mà không grep imports trước → có thể break build

---

## Next tasks (thứ tự ưu tiên)

1. **Fix 13 `any` types** — locations/page.tsx, action-plan/[id]/page.tsx, users/page.tsx
2. **Quick wins** — CHANGELOG.md, package.json name, xóa clone-website skill
3. **Wire locations API** — thay mock data bằng real API
4. **Micro 1.3** — test RTL cho app-sidebar (role-based menu)
5. **Slice 2** — CA Setup: master-data pages (brands, stores, users)
