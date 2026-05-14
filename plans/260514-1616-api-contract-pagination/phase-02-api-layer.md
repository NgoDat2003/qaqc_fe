# Phase 02 — API Layer: 8 Endpoint Functions

**Priority:** High (blocks Phase 3)
**Status:** ✅ done
**Effort:** ~45 min
**Depends on:** Phase 01

## Overview

Cập nhật 5 API files để dùng `apiClient.list<T>()` thay vì `apiClient.get<T[]>()`. Mỗi function cần accept pagination params + typed filters.

## Files cần sửa

| File | Endpoints |
|------|-----------|
| `src/features/audit/api/audit.api.ts` | GET /audits, GET /audit-plans |
| `src/features/action-plan/api/action-plan.api.ts` | GET /action-plans |
| `src/features/master-data/api/master.api.ts` | GET /stores, GET /users, GET /brands |
| `src/features/checklist/api/checklist.api.ts` | GET /checklists |
| `src/features/criteria/api/criteria.api.ts` | GET /criteria |

## Implementation Steps

### `audit.api.ts` — getAudits + getPlans

```typescript
import type { Audit, AuditPlanSummary, ListResponse, ListParams } from "@/shared/types";

type AuditListParams = ListParams & { storeId?: string };
type AuditPlanListParams = ListParams;

// Thay getAudits
getAudits: (params?: AuditListParams): Promise<ListResponse<Audit>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()}` : "";
  return apiClient.list<Audit>(`/audits${qs}`);
},

// Thay getPlans
getPlans: (params?: AuditPlanListParams): Promise<ListResponse<AuditPlanSummary>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()}` : "";
  return apiClient.list<AuditPlanSummary>(`/audit-plans${qs}`);
},
```

> Tip: Extract `buildQS(params)` helper nếu file có nhiều list functions.

### `action-plan.api.ts` — getAll

```typescript
import type { ActionPlan, ListResponse, ListParams } from "@/shared/types";

type ActionPlanListParams = ListParams & {
  storeId?: string;
  status?: "draft" | "submitted" | "rejected" | "closed";
};

getAll: (params?: ActionPlanListParams): Promise<ListResponse<ActionPlan>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()}` : "";
  return apiClient.list<ActionPlan>(`/action-plans${qs}`);
},
```

### `master.api.ts` — getStores + getUsers + getBrands

```typescript
import type { Store, User, Brand, ListResponse, ListParams } from "@/shared/types";

type StoreListParams = ListParams & { brandId?: string; isActive?: boolean };
type UserListParams = ListParams;
type BrandListParams = ListParams;

getStores: (params?: StoreListParams): Promise<ListResponse<Store>> => {
  const raw = params ? {
    ...params,
    ...(params.isActive !== undefined ? { isActive: String(params.isActive) } : {}),
  } : undefined;
  const qs = raw ? `?${new URLSearchParams(
    Object.entries(raw)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()}` : "";
  return apiClient.list<Store>(`/stores${qs}`);
},

getUsers: (params?: UserListParams): Promise<ListResponse<User>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )}` : "";
  return apiClient.list<User>(`/users${qs}`);
},

getBrands: (params?: BrandListParams): Promise<ListResponse<Brand>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )}` : "";
  return apiClient.list<Brand>(`/brands${qs}`);
},
```

### `checklist.api.ts` — getForms

```typescript
import type { ChecklistSummary, ListResponse, ListParams } from "@/shared/types";

type ChecklistListParams = ListParams & { status?: string };

// Thay getForms — đổi return type ChecklistForm[] → ChecklistSummary
getForms: (params?: ChecklistListParams): Promise<ListResponse<ChecklistSummary>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )}` : "";
  return apiClient.list<ChecklistSummary>(`/checklists${qs}`);
},
```

**Lưu ý:** Return type đổi từ `ChecklistForm[]` → `ChecklistSummary`. Bất kỳ chỗ nào đang dùng `checklist.sections` từ list call sẽ báo TypeScript error → fix ở Phase 4.

### `criteria.api.ts` — getCriteria

```typescript
import type { Criteria, ListResponse, ListParams } from "@/shared/types";

type CriteriaListParams = ListParams & { groupId?: string };

getCriteria: (params?: CriteriaListParams): Promise<ListResponse<Criteria>> => {
  const qs = params ? `?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )}` : "";
  return apiClient.list<Criteria>(`/criteria${qs}`);
},
```

## Helper Suggestion

Nếu thấy pattern `buildQS` lặp nhiều, có thể extract vào `src/lib/build-qs.ts`:

```typescript
export function buildQS(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
}
```

Tùy từng file — nếu chỉ 1-2 list functions thì inline luôn, không cần tách.

## Success Criteria

- [ ] 8 list functions đã đổi sang `apiClient.list<T>()`
- [ ] Return type chính xác (`ListResponse<T>`)
- [ ] `npm run typecheck` pass
- [ ] Không còn `apiClient.get<T[]>()` trong các list functions

## Risks

- `ChecklistSummary` thay `ChecklistForm` → sẽ có TS errors ở screens đang đọc `.sections` → bình thường, fix ở Phase 4
- `AuditPlanSummary` thay `AuditPlan` → sẽ có TS errors ở screens đọc `.assignments` → fix ở Phase 4
