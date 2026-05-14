# Phase 01 — Foundation: Types + API Client

**Priority:** Critical (blocks all other phases)
**Status:** ✅ done
**Effort:** ~30 min

## Overview

Thêm `PaginationMeta`, `ListResponse<T>`, các summary types mới, và `apiClient.list<T>()`. Đây là foundation cho toàn bộ migration.

## Files cần sửa

- `src/shared/types/index.ts`
- `src/lib/api-client.ts`

## Implementation Steps

### 1. `src/shared/types/index.ts` — Thêm types mới

Thêm vào sau block `ApiResponse`:

```typescript
// Pagination
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ListParams = {
  page?: number;
  limit?: number;
};
```

Thêm `ChecklistSummary` (list route không trả nested sections nữa):

```typescript
// Checklist list item — summary only (no sections/items/criteria)
export type ChecklistSummary = {
  id: string;
  name: string;
  version: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sections: number;
    auditPlans: number;
    audits: number;
  };
};
```

Thêm `AuditPlanSummary` (list route không trả nested assignments nữa):

```typescript
// AuditPlan list item — summary only (no assignments array)
export type AuditPlanSummary = {
  id: string;
  name: string;
  type: string;
  scope: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  form: {
    id: string;
    name: string;
    version: string;
    status: string;
  };
  _count: {
    assignments: number;
  };
};
```

Update `ApiResponse.meta` để chặt hơn (optional vì detail routes không có meta):

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}
```

### 2. `src/lib/api-client.ts` — Thêm `list<T>()` method

Thêm helper function bên trong module (sau `request()`):

```typescript
async function listRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ListResponse<T>> {
  const res = await fetch(`${BE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiClientError(401, "Unauthorized");
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    const message =
      (typeof json.error === "string" ? json.error : (json.error as { message?: string })?.message) ||
      "Request failed";
    throw new ApiClientError(res.status, message);
  }

  return {
    data: (json as ApiResponse<T[]>).data,
    meta: (json as ApiResponse<T[]>).meta as PaginationMeta,
  };
}
```

Import `ListResponse`, `PaginationMeta` từ shared types. Thêm `list` vào export `apiClient`:

```typescript
export const apiClient = {
  // ... existing methods (get, post, patch, put, delete) giữ nguyên ...
  list: <T>(path: string, init?: RequestInit) =>
    listRequest<T>(path, { method: "GET", ...init }),
};
```

**Quan trọng:** KHÔNG sửa method `get<T>()` hiện tại — sẽ break các detail/mutation endpoints đang dùng.

## Success Criteria

- [ ] `PaginationMeta`, `ListResponse<T>`, `ListParams` exported từ `shared/types`
- [ ] `ChecklistSummary`, `AuditPlanSummary` exported
- [ ] `apiClient.list<T>()` hoạt động và trả `{ data: T[], meta: PaginationMeta }`
- [ ] `npm run typecheck` pass sau khi sửa 2 files này (không import gì mới từ phases sau)

## Risk

- Nếu `ApiResponse.meta` đang được type-check ở nơi khác với shape cũ → cần check sau khi update
- `listRequest` duplicate logic với `request` → acceptable vì pattern khác nhau (không worth abstraction)
