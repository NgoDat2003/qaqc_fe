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

**Đang ở:** Micro 1.3 — viết test cho `app-sidebar`

**Đã xong (có code thật):**
- ✅ Infrastructure: middleware, api-client, auth store, types, scoring
- ✅ Shared components: sidebar, layouts, grade-badge, score-badge, confirm-dialog, file-uploader
- ✅ Features: auth, master-data, criteria, checklist, audit, action-plan, dashboard
- ✅ Testing infra: Vitest + MSW + @testing-library/react (setup.ts, msw-server.ts)

**Chưa có test nào** — đây là việc đang cần làm.

**Known issues:**
- Cookie `qo_token` hết hạn nhưng localStorage vẫn `isAuthenticated: true` → cần `GET /api/auth/me` khi app init
- Checklists page đang dùng mock data, chưa nối API thật

---

## Codebase map

```
src/
├── app/
│   ├── (auth)/login/         ← Login page
│   └── (dashboard)/          ← Protected routes (sidebar + header)
│       ├── dashboard/
│       ├── master-data/      ← organization, users, import
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
│   ├── ui/                   ← shadcn primitives (không sửa)
│   ├── shared/               ← dùng chung toàn app
│   └── app-sidebar.tsx       ← sidebar role-aware (đang viết test)
├── shared/types/index.ts     ← SOURCE OF TRUTH — không xóa field
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

---

## Failed approaches (đừng thử lại)

- `apiClient.post()` để upload file → JSON.stringify(FormData) = `{}`
- Chạy test mà không mock `next/navigation` → crash vì không có router context

---

## Next tasks (BUILD_PLAN.md order)

1. **Micro 1.3** — test RTL cho app-sidebar (role-based menu)
2. **Slice 2** — CA Setup: master-data pages (brands, stores, users)
3. **Slice 3** — QAM Setup: criteria + checklist builder
4. **Slice 4** — Audit Planning
5. **Slice 5** — QC Execute Audit ⭐ (quan trọng nhất)
