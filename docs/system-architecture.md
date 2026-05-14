# System Architecture — Maycha QA/QC Frontend

---

## Tổng Quan

Web app số hóa quy trình kiểm tra chất lượng chuỗi trà sữa MayCha. Thay thế Google Form + Excel.

```
Browser
  └── Next.js 16 (App Router) — port 3001
        ├── src/app/           ← Routes (App Router)
        ├── src/features/      ← Domain modules (feature-based)
        ├── src/shared/        ← Shared components, types, APIs
        ├── src/stores/        ← Zustand global state
        └── src/lib/           ← Utilities, API client
              │
              │ HTTP + cookie (maycha_at)
              ▼
        Next.js API Routes — port 3000 (qaqc-be)
              │
              ▼
        Prisma ORM → PostgreSQL
```

---

## Cấu Trúc Thư Mục

```
src/
├── app/
│   ├── (auth)/login/          ← Public route
│   └── (dashboard)/           ← Protected routes
│       ├── dashboard/
│       ├── master-data/       ← Users, stores, organizations
│       └── operations/        ← Audits, checklists, criteria, action plans
│
├── features/                  ← Feature-based modules
│   ├── auth/                  ← Login, session
│   ├── audit/                 ← Audit execution (QC flow)
│   ├── checklist/             ← Checklist builder (QAM flow)
│   ├── criteria/              ← Criteria management
│   ├── action-plan/           ← Action plan (fix loop)
│   ├── master-data/           ← Users, stores, brands
│   └── dashboard/             ← Role-based dashboards
│
├── shared/
│   ├── types/index.ts         ← Source of truth for all TypeScript types
│   ├── components/            ← Reusable UI components
│   └── api/                   ← Upload API, notifications
│
├── stores/
│   ├── auth.store.ts          ← User session + role (Zustand + persist)
│   └── ui.store.ts            ← UI state
│
└── lib/
    ├── api-client.ts          ← Single HTTP client (all API calls go here)
    ├── scoring.ts             ← CHEP scoring engine
    ├── roles.ts               ← Role permission helpers
    └── format.ts              ← Date, number formatting
```

---

## API Layer

**Tất cả requests đi qua `src/lib/api-client.ts`** — không fetch trực tiếp.

```
src/features/{domain}/api/{domain}.api.ts
         ↓ gọi
src/lib/api-client.ts  (request wrapper)
         ↓ HTTP credentials:"include"
BE: http://localhost:3000/api/{endpoint}
```

Cookie `qo_token` được set bởi BE, browser tự gửi với mỗi request.

**Upload file** — dùng riêng `src/shared/api/upload.api.ts` (không dùng apiClient).

---

## Auth & Role System

```
Login → BE set cookie (maycha_at)
      → useAuthStore.setAuth(user, availableRoles, activeRole)
      → Zustand persist (localStorage)

activeRole: RoleKey  ← determines UI & permissions
```

| Role | Mô tả |
|---|---|
| `company_admin` | Toàn quyền |
| `qa_manager` | Tạo checklist, lên kế hoạch audit |
| `qc_auditor` | Thực hiện audit tại cửa hàng |
| `am` | Area Manager — xem kết quả khu vực |
| `store_manager` | Xem kết quả + action plan của cửa hàng |
| `executive_viewer` | Xem báo cáo tổng hợp |

Route guard: `src/shared/components/role-guard.tsx`

---

## Scoring Engine

File: `src/lib/scoring.ts`

| Tiêu chí | Trọng số |
|---|---|
| C (Cleanliness) | 30% |
| H (Hospitality) | 15% |
| P (Product Quality) | 15% |
| E (Expiry/Standards) | 40% |

Special rules:
- **CCP** (Critical Control Point): Một lỗi CCP → toàn nhóm về 0
- **RISK**: Lỗi đặc biệt nghiêm trọng → toàn bài về 0

---

## Feature Modules (Pattern Chuẩn)

Mỗi feature tuân theo cấu trúc:
```
src/features/{domain}/
├── api/{domain}.api.ts        ← API calls
├── hooks/use-{domain}.ts      ← TanStack Query hooks
├── components/                ← UI components
└── index.ts                   ← Public exports
```

---

## Priority Screens

| Screen | Role | Độ phức tạp |
|---|---|---|
| **Audit Execute** | QC Auditor | ⭐ Cao nhất — 3-breakpoint responsive |
| **Checklist Builder** | QA Manager | Cao |
| **Audit Planning** | QA Manager | Trung bình |
| **Action Plan Detail** | SM / AM | Trung bình |

---

## Action Plan Status Machine

```
draft → submitted → rejected ⤴
                       ↓
                    submitted
                       ↓
                     closed
```

| Status | Meaning | Owner |
|---|---|---|
| `draft` | AP created but not submitted | SM |
| `submitted` | AP submitted for review | SM → QAM |
| `rejected` | QAM rejected — SM can resubmit | QAM → SM |
| `closed` | QAM approved and closed | QAM |

---

## Dashboard Components (Role-Based)

All dashboard implementations in `src/features/dashboard/`:

| Role | Component | Status |
|---|---|---|
| **Company Admin (CA)** | `ca-dashboard.tsx` | ✅ Implemented |
| **QA Manager (QAM)** | `qam-dashboard.tsx` | ✅ Implemented |
| **QC Auditor** | `qc-dashboard.tsx` | ✅ Implemented |
| **Area Manager (AM)** | `am-dashboard.tsx` | ✅ Implemented |
| **Store Manager (SM)** | `sm-dashboard.tsx` | ✅ Implemented |
| **Executive Viewer (EV)** | `ev-dashboard.tsx` | ✅ Implemented |

**Utility:** `full-system-dashboard.tsx` — comprehensive dashboard component for system-wide analytics.

---

## Key Files (Không Được Tự Ý Sửa)

| File | Vai trò |
|---|---|
| `src/shared/types/index.ts` | Source of truth cho tất cả TypeScript types |
| `src/lib/api-client.ts` | Core HTTP client — mọi API call đều đi qua đây |
| `src/lib/scoring.ts` | CHEP scoring logic — critical business rules |
