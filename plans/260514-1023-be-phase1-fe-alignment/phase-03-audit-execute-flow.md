# Phase 3: Audit Execute Flow

**Priority:** High — core QC workflow  
**Effort:** ~3h  
**Status:** ✅ done  
**Requires:** Phase 1 done

## Overview

Execute page hiện là placeholder. Cần implement full audit execution với 3-breakpoint responsive và repeat info display sau submit.

## Current State

```
/audits/[id]/execute/page.tsx  → placeholder, chỉ hiện "đang phát triển"
use-audit-execute.ts           → useSubmitAudit trả Audit (sai), useCalculateScore/useSaveAuditDraft (old)
audit.api.ts                   → submitAudit return type sai, calculateScore/saveDraft endpoints không còn
```

## What BE Provides

**Submit input** (`POST /api/audits/submit`):
```typescript
{
  assignmentId: string
  violations: Array<{
    criteriaId: string
    numErrors: number        // QC điền số lỗi
    note?: string | null
    evidenceUrls?: string[]  // URLs từ upload
  }>
}
// NO repeatCount — BE tự tính
```

**Submit response** (`SubmitAuditResponse`):
```typescript
{
  id: string
  finalScore: number
  grade: "excellent" | "good" | "pass" | "fail" | "alarm"
  isRiskTriggered: boolean
  repeatInfo: Array<{
    criteriaId: string
    numErrors: number
    repeatCount: number
    repeatLabel: "first" | "second" | "third" | "auto_ccp" | "reset"
    isCriticalTriggered: boolean
  }>
}
```

**Get assignment checklist**: `/audits/:id` hoặc `/audit-plans/my-assignments` — cần verify endpoint thực tế.

## Implementation Steps

### Step 3.1 — Clean up hooks (`src/features/audit/hooks/use-audit-execute.ts`)

```typescript
// KEEP: useAuditChecklist (but check if endpoint /audits/:id/checklist exists)
// UPDATE: useSubmitAudit — mutationFn trả SubmitAuditResponse
export function useSubmitAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AuditDraft) => auditApi.submitAudit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
      qc.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}
// REMOVE: useSaveAuditDraft, useCalculateScore
```

### Step 3.2 — New component: `repeat-info-display.tsx`

File: `src/features/audit/components/execution/repeat-info-display.tsx`

Hiển thị repeat info sau khi submit. Props: `repeatInfo: RepeatInfo[]`.

```typescript
// Label → color/icon mapping
const LABEL_META = {
  first:    { label: "Lần 1",        color: "text-muted-foreground", warn: false },
  second:   { label: "Lặp lần 2",    color: "text-warning",          warn: false },
  third:    { label: "Lặp lần 3",    color: "text-orange-600",       warn: true  },
  auto_ccp: { label: "CCP tự động",  color: "text-danger",           warn: true  },
  reset:    { label: "Reset về lần 1", color: "text-success",         warn: false },
};
```

Component shows:
- List các tiêu chí có lỗi với repeat label + color
- Warning banner nếu bất kỳ item nào có `isCriticalTriggered = true` hoặc `repeatLabel === "auto_ccp"`:
  ```
  ⚠️ CCP kích hoạt — điểm nhóm bị đưa về 0
  ```

### Step 3.3 — Implement execute page

File: `src/app/(dashboard)/operations/audits/[id]/execute/page.tsx`

**Note**: `params.id` trong page này là `assignmentId` theo URL `/my-audits → execute`. Cần lấy checklist từ assignment.

**Page flow:**
```
1. Load assignment + checklist (useAuditChecklist(assignmentId))
2. Local state: violations map { criteriaId → { numErrors, note, evidenceUrls[] } }
3. Tabs theo section (CHEP)
4. Mỗi criteria: số lỗi input (0..N) + note + evidence upload
5. Sticky bottom bar: Submit button
6. Sau submit: hiển thị RepeatInfoDisplay + score result
7. Redirect về my-audits sau 3s hoặc user bấm "Xem kết quả"
```

**State management** (local, không persist — draft được manage ở client):
```typescript
type ViolationState = {
  numErrors: number;
  note: string;
  evidenceUrls: string[];
};
// Map: criteriaId → ViolationState
const [violations, setViolations] = useState<Record<string, ViolationState>>({});
```

**Submit handler:**
```typescript
const handleSubmit = async () => {
  const input: AuditDraft = {
    assignmentId,
    violations: Object.entries(violations)
      .filter(([, v]) => v.numErrors > 0)  // chỉ gửi criteria có lỗi
      .map(([criteriaId, v]) => ({
        criteriaId,
        numErrors: v.numErrors,
        note: v.note || null,
        evidenceUrls: v.evidenceUrls,
      })),
  };
  const result = await submitAudit.mutateAsync(input);
  // result là SubmitAuditResponse — show repeat info + score
};
```

**CCP/RISK UX:**
- Sau submit, nếu `result.isRiskTriggered = true` → show full-screen warning trước repeat info
- Nếu bất kỳ `isCriticalTriggered = true` → warning banner trong repeat info

**Responsive UI (3-breakpoint, desktop-first):**
- Layout: `max-w-2xl mx-auto` (consistent với AP detail page)
- Criteria card: number input với `+` / `-` buttons (usable ở cả desktop lẫn mobile)
- Evidence: standard file input (`accept="image/*"`) — browser tự handle camera trên mobile
- Submit bar: `sticky bottom-0 bg-background border-t`
- Grid: `grid grid-cols-1 md:grid-cols-2` cho criteria cards nếu phù hợp

### Step 3.4 — My Audits page (`src/app/(dashboard)/operations/my-audits/page.tsx`)

Check current state — nếu đang dùng `getMyAssignments()` hook cũ hay real API:

```typescript
// Hook: useMyAudits → getMyAssignments() → GET /audit-plans/my-assignments
// Nếu chưa implement → add useMyAssignments hook vào use-audit-execute.ts
```

Assignment card hiển thị: store name, scheduled date, status badge (pending/completed).
Link đến execute page: `/operations/audits/${assignment.id}/execute`.

## Files to Create

- `src/features/audit/components/execution/repeat-info-display.tsx` (new)

## Files to Modify

- `src/features/audit/hooks/use-audit-execute.ts` (clean up old hooks)
- `src/features/audit/api/audit.api.ts` (remove calculateScore, saveDraft)
- `src/app/(dashboard)/operations/audits/[id]/execute/page.tsx` (implement from placeholder)
- `src/app/(dashboard)/operations/my-audits/page.tsx` (verify API wiring)

## Success Criteria

- Execute page render được assignment checklist
- QC có thể điền số lỗi, note, upload evidence mỗi criteria
- Submit gọi `POST /api/audits/submit` với đúng payload (không có repeatCount)
- Sau submit: hiển thị `finalScore`, `grade`, repeat info với label đúng
- CCP warning hiện ra khi `isCriticalTriggered = true`
- `npm run typecheck` passes

## Risk

- Endpoint `/audits/:id/checklist` chưa chắc tồn tại ở BE — nếu không có, load từ assignment detail qua `/audit-plans/my-assignments`
- `params.id` ở execute page là assignmentId hay auditId? Cần verify URL convention trong `my-audits/page.tsx`
- Evidence upload trả `{ id, url }` — cần `uploadApi.uploadEvidence()` đang hoạt động
