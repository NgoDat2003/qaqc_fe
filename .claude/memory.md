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

**Đang ở:** Phase 2 — Fix remaining issues sau base cleanup

**Pending merge:** Branch `chore/update-workflow-rules` — update workflow.md (branch workflow + worktree rules)

**Đã xong:**
- ✅ Tạo `.claude/` structure: memory.md, rules/, agents/ (workflow, tech-defaults, design, researcher, reviewer, qa-tester)
- ✅ Xóa các file duplicate/orphan sau khi verify import (typecheck PASSED)
  - Xóa: `src/features/master-data/components/` (3 stub drawers, zero imports)
  - Xóa: `src/components/operations/criteria-drawer.tsx`
  - Xóa: `src/features/criteria/components/criteria-drawer.tsx`
  - Xóa: `src/components/shared/` — page-header, role-guard, confirm-dialog, file-uploader, grade-badge, data-table, empty-state
  - **GIỮ LẠI:** `src/components/shared/score-badge.tsx` (format.ts import ScoreGrade type từ đây)
- ✅ Canonical paths đã xác nhận:
  - Components dùng chung: `src/shared/components/` (KHÔNG phải `src/components/shared/`)
  - Master-data drawers thật: `src/components/master-data/` (4 drawers có active imports)
- ✅ Fix 13 `any` types (commit `9d1ca9c`) — locations, settings/users, action-plan, audit.api.ts

**Chưa làm — cần làm tiếp (theo thứ tự ưu tiên):**

### 1. Quick wins
- `CHANGELOG.md` — xóa từ line 30 trở xuống (nội dung từ template gốc `ai-website-clone-template`)
- `package.json` — đổi `"name": "ai-website-clone-template"` sang tên đúng
- Xóa `.claude/skills/clone-website/` — 474-line skill không liên quan QA/QC

### 2. Wire locations API
- `src/app/(dashboard)/master-data/locations/page.tsx` đang dùng mock data + `console.log`
- Cần wire vào real API (stores, brands từ `features/master-data/`)

### 3. ESLint no-any rule
- Thêm rule vào config để enforce TypeScript strictness

### 4. Viết test (Micro 1.3)
- Test cho `src/components/app-sidebar.tsx` — role-based menu
- Theo qa-tester.md: Unit (behavior user thấy) + Integration (MSW mock)

### 5. Tạo E2E test directory
- `playwright.config.ts` reference `./e2e` nhưng folder chưa tồn tại

### 6. Fix auth issue
- Cookie `qo_token` hết hạn nhưng localStorage `isAuthenticated: true`
- Fix: gọi `GET /api/auth/me` khi app init

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
