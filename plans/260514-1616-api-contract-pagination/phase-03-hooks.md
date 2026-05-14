# Phase 03 — Hooks: 8 List Hooks

**Priority:** High (blocks Phase 4)
**Status:** ✅ done
**Effort:** ~45 min
**Depends on:** Phase 02

## Overview

Cập nhật 8 hooks để nhận pagination params, truyền xuống API, và trả `ListResponse<T>` thay vì `T[]`. Query keys phải bao gồm pagination params để invalidate cache đúng.

## Files cần sửa

| Hook file | Current | Target |
|-----------|---------|--------|
| `src/features/audit/hooks/use-audits.ts` | `Audit[]` | `ListResponse<Audit>` |
| `src/features/audit/hooks/use-audit-plans.ts` | `AuditPlan[]` | `ListResponse<AuditPlanSummary>` |
| `src/features/action-plan/hooks/use-action-plans.ts` | `ActionPlan[]` | `ListResponse<ActionPlan>` |
| `src/features/master-data/hooks/use-stores.ts` | `Store[]` | `ListResponse<Store>` |
| `src/features/master-data/hooks/use-users.ts` | `User[]` | `ListResponse<User>` |
| `src/features/master-data/hooks/use-brands.ts` | `Brand[]` | `ListResponse<Brand>` |
| `src/features/checklist/hooks/use-checklists.ts` | `ChecklistForm[]` | `ListResponse<ChecklistSummary>` |
| `src/features/criteria/hooks/use-criteria.ts` | `Criteria[]` | `ListResponse<Criteria>` |

## Pattern Chuẩn

Mọi hook đều theo pattern này:

```typescript
import type { XxxListParams } from "@/features/xxx/api/xxx.api";
import type { ListResponse } from "@/shared/types";

export function useXxxList(params?: XxxListParams) {
  return useQuery<ListResponse<Xxx>>({
    queryKey: ["xxx-list", params],   // params trong key → cache per filter+page
    queryFn: () => xxxApi.getAll(params),
    placeholderData: keepPreviousData, // giữ data cũ khi đổi trang → UX smoother
  });
}
```

`keepPreviousData` từ TanStack Query v5: `import { keepPreviousData } from "@tanstack/react-query"`.

## Implementation Steps

### `use-audits.ts`

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import type { Audit, ListResponse } from "@/shared/types";

type Params = { page?: number; limit?: number; storeId?: string };

export function useAudits(params?: Params) {
  return useQuery<ListResponse<Audit>>({
    queryKey: ["audits", params],
    queryFn: () => auditApi.getAudits(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-audit-plans.ts`

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import type { AuditPlanSummary, ListResponse } from "@/shared/types";

type Params = { page?: number; limit?: number };

export function useAuditPlans(params?: Params) {
  return useQuery<ListResponse<AuditPlanSummary>>({
    queryKey: ["audit-plans", params],
    queryFn: () => auditApi.getPlans(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-action-plans.ts`

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { actionPlanApi } from "../api/action-plan.api";
import type { ActionPlan, ListResponse } from "@/shared/types";

type Params = {
  page?: number;
  limit?: number;
  storeId?: string;
  status?: "draft" | "submitted" | "rejected" | "closed";
};

export function useActionPlans(params?: Params) {
  return useQuery<ListResponse<ActionPlan>>({
    queryKey: ["action-plans", params],
    queryFn: () => actionPlanApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-stores.ts`

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { masterApi } from "../api/master.api";
import type { Store, ListResponse } from "@/shared/types";

type Params = { page?: number; limit?: number; brandId?: string; isActive?: boolean };

export function useStores(params?: Params) {
  return useQuery<ListResponse<Store>>({
    queryKey: ["stores", params],
    queryFn: () => masterApi.getStores(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-users.ts`

```typescript
export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery<ListResponse<User>>({
    queryKey: ["users", params],
    queryFn: () => masterApi.getUsers(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-brands.ts`

```typescript
export function useBrands(params?: { page?: number; limit?: number }) {
  return useQuery<ListResponse<Brand>>({
    queryKey: ["brands", params],
    queryFn: () => masterApi.getBrands(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-checklists.ts`

```typescript
import type { ChecklistSummary, ListResponse } from "@/shared/types";

type Params = { page?: number; limit?: number; status?: string };

export function useChecklists(params?: Params) {
  return useQuery<ListResponse<ChecklistSummary>>({
    queryKey: ["checklists", params],
    queryFn: () => checklistApi.getForms(params),
    placeholderData: keepPreviousData,
  });
}
```

### `use-criteria.ts`

```typescript
type Params = { page?: number; limit?: number; groupId?: string };

export function useCriteria(params?: Params) {
  return useQuery<ListResponse<Criteria>>({
    queryKey: ["criteria", params],
    queryFn: () => criteriaApi.getCriteria(params),
    placeholderData: keepPreviousData,
  });
}
```

## Query Key Strategy

| Hook | Key pattern | Note |
|------|-------------|------|
| `useAudits` | `["audits", { page, limit, storeId }]` | Đổi page → cache miss → fetch mới |
| `useActionPlans` | `["action-plans", { page, limit, storeId, status }]` | status filter server-side |
| `useAuditPlans` | `["audit-plans", { page, limit }]` | Đơn giản |
| `useStores` | `["stores", { page, limit, brandId, isActive }]` | isActive là boolean |
| `useUsers` | `["users", { page, limit }]` | Đơn giản |
| `useBrands` | `["brands", { page, limit }]` | Đơn giản |
| `useChecklists` | `["checklists", { page, limit, status }]` | status filter giữ nguyên |
| `useCriteria` | `["criteria", { page, limit, groupId }]` | groupId filter server-side |

## Backward Compatibility Concern

Screens cũ đang dùng `hook.data` là `T[]`. Sau phase này, `hook.data` là `ListResponse<T>`. Điều đó có nghĩa `hook.data.data` là array, `hook.data.meta` là pagination. Screens sẽ báo TS error → fix ở Phase 4.

## Success Criteria

- [ ] 8 hooks đã update, return `ListResponse<T>`
- [ ] Query keys bao gồm params
- [ ] `keepPreviousData` được dùng
- [ ] `npm run typecheck` — có thể có TS errors ở screens (chờ Phase 4 fix)
