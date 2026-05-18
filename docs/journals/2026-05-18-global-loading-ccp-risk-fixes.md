# Global Loading Bar & CCP/RISK Logic Implementation

**Date**: 2026-05-18 14:30
**Severity**: Medium
**Component**: UI Loading Bar, Criteria Management
**Status**: Resolved

## What Happened

Implemented two critical features in the same session:
1. **Global Loading Bar** — A slim 2px top-of-page progress bar driven by TanStack Query's `useIsFetching` count
2. **CCP/RISK Display Logic** — Fixed criteria drawer and page to properly handle special flag types (Critical Control Point & Risk)

Both features required careful state management and conditional rendering to avoid ESLint errors and timer leaks.

## The Brutal Truth

This session exposed a fundamental gap in my understanding of backend contract first. I started implementing CCP/RISK assuming certain behaviors, then had to backtrack when reading BE docs that clarified RISK is truly global (no groupId). The frustration wasn't the rework itself — it was that the documentation should have been read BEFORE implementation, not after.

The loading bar timer leak fix was equally embarrassing. I hoisted the `hideTimer` variable to effect scope to ensure cleanup could cancel both outer and inner timeouts. This is a basic JavaScript gotcha that should be second nature.

## Technical Details

### Global Loading Bar (`src/shared/components/global-loading-bar.tsx`)

```typescript
// Core: derived state from fetching count (no setState in effect)
const animating = fetching > 0;

// Timer management: hideTimer hoisted to effect scope for proper cleanup
useEffect(() => {
  if (fetching > 0) {
    setVisible(true);
  } else {
    let hideTimer: ReturnType<typeof setTimeout>;
    const t = setTimeout(() => {
      hideTimer = setTimeout(() => setVisible(false), 300);
    }, 200);
    return () => {
      clearTimeout(t);
      clearTimeout(hideTimer);  // Both timers cancelled on cleanup
    };
  }
}, [fetching]);
```

**Key points:**
- Uses `useIsFetching()` from @tanstack/react-query (counts in-flight requests)
- Shows bar at 85% width while animating, completes to 100% when idle
- 200ms delay before fade to let bar visually "finish"
- No ESLint warnings because `animating` is derived, not state

### CCP/RISK Display Logic

**Schema validation (`criteria-drawer.tsx`):**
- `groupId` required ONLY for `flag !== "risk"`
- `deductionPerError` & `maxDeduction` validated ONLY for `flag === "none"`
- RISK-flagged criteria don't expose deduction fields at all

**UI conditional rendering:**
```typescript
const isSpecialFlag = currentFlag === "critical" || currentFlag === "risk";

// When CCP/RISK: show info box instead of deduction inputs
{isSpecialFlag ? (
  <div className={`...${currentFlag === "critical" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
    {currentFlag === "critical"
      ? "⚠ CCP: Khi vi phạm → toàn nhóm tiêu chí về 0 điểm."
      : "⛔ RISK: Khi vi phạm → toàn bài về 0 điểm (global)."}
  </div>
) : (
  // Show deduction inputs for normal criteria
)}
```

**Handle flag change:**
```typescript
handleFlagChange = useCallback((val: "none" | "critical" | "risk" | null) => {
  if (!val) return;
  form.setValue("flag", val);
  if (val !== "none") {
    form.setValue("deductionPerError", 0);
    form.setValue("maxDeduction", 0);
    form.clearErrors(["deductionPerError", "maxDeduction"]);
  }
  if (val === "risk") {
    form.setValue("groupId", "");  // RISK is global — clear group
    form.clearErrors(["groupId"]);
  }
}, [form]);
```

**Page-level transform:**
```typescript
// criteria/page.tsx handleSubmit
const payload = {
  ...values,
  groupId: values.groupId === "" ? null : values.groupId,  // "" → null for RISK
};
```

### Section Display (Impact Messaging)

**`criteria/page.tsx` deduction column:**
```typescript
{
  accessorKey: "flag",
  header: "Trừ điểm",
  cell: ({ row }) => {
    const flag = row.original.flag;
    if (flag === "critical") return "Toàn nhóm về 0";
    if (flag === "risk") return "Toàn bài về 0";
    return `Tối đa ${row.original.maxDeduction}`;
  },
}
```

**`section-card.tsx` calculation:**
```typescript
// totalMaxDeduction only counts non-special items
const totalMaxDeduction = items
  .filter(item => item.flag === "none")
  .reduce((sum, item) => sum + item.maxDeduction, 0);
```

## What We Tried

1. **First attempt:** Assumed RISK needs a groupId but with special handling. ❌ Wrong — BE docs confirm RISK sends `groupId=null`.
2. **Timer implementation:** Initially cleared only outer timeout. ❌ Left hideTimer leak.
3. **ESLint:** setVisible inside effect when animating changes. ❌ Derived state instead.

## Root Cause Analysis

**Why the RISK confusion?** 
- Didn't read BE schema docs before implementation
- Assumed domain logic from naming alone ("RISK" sounds like it might relate to groups)
- Only caught after reviewing API contract with backend

**Why timer leak?**
- Basic JavaScript scoping mistake: didn't realize inner timeout needed cleanup
- Cleanup function only cleared outer timeout, not the hidden inner one

## Lessons Learned

1. **Read API contracts FIRST** — Especially when dealing with special flags or domain rules. Don't infer from naming.
2. **Test timer cleanup** — Add console logs during development to verify both timers actually cancel. This caught the leak immediately.
3. **Derive state, don't create it** — The `animating` boolean doesn't need useState. Just use `fetching > 0` directly in render.
4. **CCP vs RISK distinction** — Cemented in codebase now:
   - CCP: affects entire criteria group → groupId still required
   - RISK: affects entire audit → groupId must be null

## Next Steps

1. Verify E2E tests cover CCP/RISK switching (criteria-drawer opens, changes flag, submits)
2. Add audit execution tests to confirm RISK flag zeros entire score
3. Monitor in UAT for any edge cases with special flags + concurrent requests
4. Update developer docs with CCP/RISK behavior matrix

---

## Files Modified
- `src/shared/components/global-loading-bar.tsx` — new component
- `src/stores/ui.store.ts` — added `loadingCount`, `startLoading()`, `stopLoading()`
- `src/features/criteria/components/criteria-drawer.tsx` — CCP/RISK logic + flag change handler
- `src/features/criteria/api/criteria.api.ts` — `groupId: string | null`
- `src/features/criteria/components/criteria/page.tsx` — deduction column display
- `src/features/checklist/components/section-card.tsx` — totalMaxDeduction calculation
- `src/app/(dashboard)/layout.tsx` — mount GlobalLoadingBar
