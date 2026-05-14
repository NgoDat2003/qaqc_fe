# Phase 1: Types + API Contract Alignment

**Priority:** Critical — blocks all other phases  
**Effort:** ~1h  
**Status:** ✅ done

## Overview

Types hiện tại sai so với BE contract. Phải fix trước khi bất kỳ phase nào có thể compile.

## What's Wrong

### `src/shared/types/index.ts`

| Issue | Current | Correct |
|-------|---------|---------|
| `ActionPlanStatus` | `"draft" \| "submitted" \| "in_progress" \| "closed"` | `"draft" \| "submitted" \| "rejected" \| "closed"` |
| `ActionPlan.update input` | `{ remediation, deadline }` | `{ actionDescription, deadline }` — BE maps internally |
| Missing types | — | `SubmitAuditResponse`, `RepeatInfo`, `RepeatLabel`, `AnalyticsOverview` |
| `ApiError.error` | `{ code, message, details, statusCode }` | BE trả `{ success: false, error: string }` — flat string |

### `src/features/action-plan/api/action-plan.api.ts`

| Method | Current | Correct |
|--------|---------|---------|
| `confirm(id)` | POST `/confirm` no body | POST `/confirm` body: `{ action: "confirm"\|"reject", reviewNote?: string }` |
| `close(id, {evidenceIds, note})` | requires evidenceIds | POST `/close` no body needed |
| `update(id, {remediation, deadline})` | field name wrong | `{ actionDescription, deadline }` |

### `src/features/audit/api/audit.api.ts`

| Method | Current | Correct |
|--------|---------|---------|
| `submitAudit` return type | `Audit` | `SubmitAuditResponse` |
| `calculateScore` | `/audits/calculate` | Endpoint không có trong BE handoff — xóa |
| `saveDraft` | `/audits/draft` | Endpoint không có trong BE handoff — xóa |
| `getAuditChecklist(id)` | `/audits/${id}/checklist` | Endpoint không có trong BE handoff — verify |

### `src/lib/api-client.ts`

- 403 hiện không được xử lý riêng → throw error là đúng, nhưng cần error message rõ ràng
- BE `ApiError` shape: `{ success: false, error: string }` (flat) — hiện FE parse sai (`error.message`, `error.statusCode`)

## Implementation Steps

### Step 1.1 — Fix `ActionPlanStatus` + add new types

File: `src/shared/types/index.ts`

```typescript
// REMOVE in_progress, ADD rejected
export type ActionPlanStatus = "draft" | "submitted" | "rejected" | "closed";

// ADD RepeatLabel
export type RepeatLabel = "first" | "second" | "third" | "auto_ccp" | "reset";

// ADD RepeatInfo
export interface RepeatInfo {
  criteriaId: string;
  numErrors: number;
  repeatCount: number;
  repeatLabel: RepeatLabel;
  isCriticalTriggered: boolean;
}

// ADD SubmitAuditResponse
export interface SubmitAuditResponse {
  id: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  repeatInfo: RepeatInfo[];
}

// ADD AnalyticsOverview
export interface AnalyticsOverview {
  totalAudits: number;
  avgScore: number;
  passRate: number;
  failCount: number;
  recentAudits?: Array<{
    id: string;
    storeId: string;
    store?: Pick<Store, "id" | "name" | "code">;
    finalScore: number;
    grade: ScoreGrade;
    submittedAt: string;
  }>;
}

// ADD ActionPlanDetail (BE /action-plans/:id shape)
export interface ActionPlanDetail {
  id: string;
  status: ActionPlanStatus;
  remediation: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  store: Pick<Store, "id" | "code" | "name">;
  audit: {
    id: string;
    finalScore: number;
    grade: ScoreGrade;
    submittedAt: string;
    violations: Array<{
      id: string;
      criteriaId: string;
      numErrors: number;
      repeatCount: number;
      isCriticalTriggered: boolean;
      isRiskTriggered: boolean;
      note: string | null;
      criteria: Pick<Criteria, "id" | "code" | "content" | "flag">;
    }>;
  };
  closedBy?: Pick<User, "id" | "fullName" | "email"> | null;
}
```

### Step 1.2 — Fix ApiError parsing

File: `src/lib/api-client.ts`

BE trả `{ success: false, error: string }` — flat string, không phải object. Fix parsing:

```typescript
// CURRENT (wrong):
const errorData = json as ApiError;
const message = errorData.error?.message || "Request failed";
const statusCode = errorData.error?.statusCode || res.status;

// FIX:
const message = (typeof json.error === "string" ? json.error : json.error?.message) || "Request failed";
const statusCode = res.status;
```

### Step 1.3 — Fix `action-plan.api.ts`

```typescript
// confirm → review (new name + body)
review: (id: string, data: { action: "confirm" | "reject"; reviewNote?: string }) =>
  apiClient.post<ActionPlan>(`/action-plans/${id}/confirm`, data),

// close → simple POST, no body
close: (id: string) =>
  apiClient.post<ActionPlan>(`/action-plans/${id}/close`, {}),

// update → fix field name
update: (id: string, data: { actionDescription: string; deadline?: string }) =>
  apiClient.patch<ActionPlan>(`/action-plans/${id}`, data),
```

### Step 1.4 — Fix `audit.api.ts`

```typescript
// submitAudit return type
submitAudit: (data: AuditDraft) => 
  apiClient.post<SubmitAuditResponse>("/audits/submit", data),

// Remove: calculateScore, saveDraft
// Keep but verify: getAuditChecklist
```

## Files to Modify

- `src/shared/types/index.ts`
- `src/lib/api-client.ts`
- `src/features/action-plan/api/action-plan.api.ts`
- `src/features/audit/api/audit.api.ts`

## Success Criteria

- `npm run typecheck` passes với 0 errors
- `ActionPlanStatus` không còn `in_progress`
- `SubmitAuditResponse` và `RepeatInfo` tồn tại trong types
- API client parse BE error shape đúng

## Risk

- Removing `calculateScore` / `saveDraft` có thể break imports ở execute page (hiện là placeholder — safe to remove)
- Đổi tên `confirm` → `review` trong api sẽ break `useConfirmActionPlan` hook → fix ngay ở Phase 2
