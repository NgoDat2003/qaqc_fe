# Phase 2: Action Plan Workflow Fix

**Priority:** High  
**Effort:** ~1.5h  
**Status:** ✅ done  
**Requires:** Phase 1 done

## Overview

AP workflow hiện tại dùng status cũ (`in_progress`, `confirmed`). Cần align với BE contract: `draft → submitted → rejected → submitted → closed`.

## Current State vs Target

### Status Machine

```
CURRENT (wrong):          TARGET (correct):
draft                     draft
  ↓ SM submit               ↓ SM submit
submitted                 submitted
  ↓ QAM confirm               ↓ QAM close (direct) OR QAM reject
in_progress               closed   OR   rejected
  ↓ QAM close                              ↓ SM re-submit
closed                                  submitted → closed
```

### UI Problems (file: `src/app/(dashboard)/operations/action-plan/[id]/page.tsx`)

| Location | Problem |
|----------|---------|
| `STATUS_META` | Has `in_progress`, missing `rejected` |
| `SMView.isEditable` | `draft || submitted` → should be `draft || rejected` |
| `SMView.handleSave` | Sends `remediation` → needs `actionDescription` |
| `QAMView` confirm button | Calls `confirm()` with no args → needs `{ action: "confirm" }` |
| `QAMView` close trigger | Checks `in_progress` → should check `submitted` |
| `QAMView` close form | Requires `evidenceIds` → not needed |
| Missing | Reject button for QAM when AP is `submitted` |
| Missing | `rejected` status display for SM (shows what was rejected, why) |

## Implementation Steps

### Step 2.1 — Fix hooks (`src/features/action-plan/hooks/use-action-plans.ts`)

```typescript
// Rename useConfirmActionPlan → useReviewActionPlan
export function useReviewActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reviewNote }: { 
      id: string; 
      action: "confirm" | "reject"; 
      reviewNote?: string 
    }) => actionPlanApi.review(id, { action, reviewNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

// Simplify useCloseActionPlan (no evidenceIds)
export function useCloseActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionPlanApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

// Fix useUpdateActionPlan field name
export function useUpdateActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; actionDescription: string; deadline?: string }) =>
      actionPlanApi.update(id, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] }),
  });
}
```

Also export `useReviewActionPlan` from `src/features/action-plan/index.ts`.

### Step 2.2 — Fix STATUS_META in AP detail page

```typescript
// src/app/(dashboard)/operations/action-plan/[id]/page.tsx

const STATUS_META: Record<ActionPlanStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected:  { label: "Rejected",  cls: "bg-red-50 text-red-700 border-red-200" },
  closed:    { label: "Closed",    cls: "bg-success-bg text-success border-success/20" },
};
```

### Step 2.3 — Fix SMView

```typescript
// isEditable: draft OR rejected (not submitted anymore)
const isEditable = plan.status === "draft" || plan.status === "rejected";

// handleSave: send actionDescription instead of remediation
await update.mutateAsync({
  id,
  actionDescription: currentRemediation,
  deadline: currentDeadline || undefined,
});

// handleSubmit: same fix
await update.mutateAsync({ id, actionDescription: currentRemediation, deadline: currentDeadline || undefined });

// Add rejected state hint (below the form)
{plan.status === "rejected" && (
  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
    <p>QA Manager đã từ chối. Vui lòng cập nhật và gửi lại.</p>
  </div>
)}

// Remove: in_progress hint text
// Replace closed display (remove closedAt reference to evidences from close form)
```

### Step 2.4 — Fix QAMView

Remove old confirm/close logic. Rewrite QAM actions:

```typescript
// Import useReviewActionPlan instead of useConfirmActionPlan
const review = useReviewActionPlan();
const close = useCloseActionPlan();

// When status === "submitted": show Reject + Close buttons
{plan.status === "submitted" && (
  <div className="flex gap-3 pt-2 border-t border-border">
    <Button
      variant="outline"
      className="border-red-300 text-red-700 hover:bg-red-50"
      onClick={() => review.mutateAsync({ id, action: "reject" })}
      disabled={review.isPending}
    >
      Reject
    </Button>
    <Button
      className="bg-success hover:bg-success/90 text-white"
      onClick={() => close.mutateAsync(id)}  // direct close via /close endpoint
      disabled={close.isPending}
    >
      <CheckCircle2 className="h-4 w-4 mr-2" />
      Close Action Plan
    </Button>
  </div>
)}

// Remove: showCloseForm state, EvidenceUploader in close form, evidenceIds state
// Remove: in_progress status blocks entirely
```

### Step 2.5 — Fix AP list page status display

File: `src/app/(dashboard)/operations/action-plan/page.tsx`

Check if `in_progress` appears in any filter/badge there → replace with `rejected`.

### Step 2.6 — Fix `APStatusBadge` component

File: `src/features/action-plan/components/ap-status-badge.tsx`

Currently `return null`. Implement a real badge (reuse STATUS_META pattern from page):

```typescript
export function APStatusBadge({ status }: { status: ActionPlanStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={`text-xs font-medium ${meta.cls}`}>{meta.label}</Badge>;
}
```

## Files to Modify

- `src/features/action-plan/hooks/use-action-plans.ts`
- `src/features/action-plan/components/ap-status-badge.tsx`
- `src/features/action-plan/index.ts` (export useReviewActionPlan)
- `src/app/(dashboard)/operations/action-plan/[id]/page.tsx`
- `src/app/(dashboard)/operations/action-plan/page.tsx` (check status filters)

## Success Criteria

- `npm run typecheck` passes
- SMView: editable khi `draft` hoặc `rejected`, submit form gửi `actionDescription`
- QAMView: Reject + Close buttons hiện ra khi AP `submitted`
- QAMView: Close không yêu cầu evidenceIds
- STATUS_META không có `in_progress`, có `rejected`
- `APStatusBadge` render thật sự

## Risk

- `useConfirmActionPlan` import ở `action-plan/[id]/page.tsx` cần rename → phải update import đồng thời
- SM close form có `evidenceIds` state → xóa sạch để không còn dead code
