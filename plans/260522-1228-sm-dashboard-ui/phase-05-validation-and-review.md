---
phase: 5
title: Validation And Review
status: completed
priority: P1
effort: 0.5d
---

# Phase 5: Validation And Review

## Overview

Verify build, lint, API behavior, browser desktop/mobile, and regression for QAM/Admin before user reviews branch.

## Requirements

- Functional: SM dashboard renders with real API and reacts to filters.
- Non-functional: no new console warnings, no broken layout, no syntax/build errors.

## Related Code Files

- Validate: `src/app/(dashboard)/dashboard/page.tsx`
- Validate: `src/features/dashboard/**/*.ts`
- Validate: `src/features/dashboard/**/*.tsx`

## Implementation Steps

1. Static checks:

```txt
npm.cmd run lint -- "src/app/(dashboard)/dashboard/page.tsx" "src/features/dashboard/**/*.ts" "src/features/dashboard/**/*.tsx"
npm.cmd run build
```

2. API/browser setup:
   - FE: `http://localhost:3001`
   - BE: `http://localhost:3000`
   - If needed, ask BE/user for seeded SM email after `npm run seed:analytics:reset`.
3. Desktop browser `1440x1000`:
   - Login SM.
   - Check `/dashboard`.
   - Compare visual to mockup.
   - Verify export URL includes current query.
4. Mobile browser `390x844`:
   - Check no horizontal overflow.
   - Filter dropdowns usable.
   - Cards/tables not clipped.
5. Regression:
   - Login QAM/Admin or switch role if available.
   - Confirm QAM/Admin dashboards still render.
6. Prepare review summary:
   - Files changed.
   - Tests run.
   - Known remaining BE/test-data caveats, if any.

## Success Criteria

- [ ] Lint targeted pass.
- [ ] Build pass.
- [ ] Desktop SM dashboard matches mockup structure.
- [ ] Mobile has no overflow.
- [ ] No console warning/error introduced by SM dashboard.
- [ ] QAM/Admin unaffected.

## Risk Assessment

- Risk: seeded SM account not documented. Mitigation: ask BE/user for email or inspect seed only if needed.
- Risk: data naturally differs from mockup. Mitigation: validate structure and mapping, not exact numeric equality.
