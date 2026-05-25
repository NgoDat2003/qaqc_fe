---
phase: 4
title: "Browser verification and handoff"
status: completed
priority: P1
effort: "0.5d"
dependencies: [3]
---

# Phase 4: Browser verification and handoff

## Overview

Validate AM dashboard behavior in build, lint, and browser, then prepare the branch for review and later merge back into dashboard core.

## Requirements

- Functional: AM user can open `/dashboard` and see the AM dashboard, not the generic fallback.
- Non-functional: no console warnings introduced, no layout overflow, no changes outside FE dashboard scope.

## Architecture

Verification covers static checks, runtime API smoke, desktop visual check, and mobile visual check. This phase does not merge to `codex/role-dashboard-ui-foundation`; it prepares the branch for review first.

## Related Code Files

- Verify: `src/app/(dashboard)/dashboard/page.tsx`
- Verify: `src/features/dashboard/**/*.ts`
- Verify: `src/features/dashboard/**/*.tsx`

## Implementation Steps

1. Run targeted lint:
   - `npm.cmd run lint -- "src/app/(dashboard)/dashboard/page.tsx" "src/features/dashboard/**/*.ts" "src/features/dashboard/**/*.tsx"`
2. Run production build:
   - `npm.cmd run build`
3. Browser desktop verification at `1440x1000`:
   - login as AM account if available;
   - open `/dashboard`;
   - verify KPI row, ranking, donut, trend, AP by store, top criteria.
4. Browser mobile verification at `390x844`:
   - verify no horizontal overflow;
   - verify filters can be opened and applied;
   - verify panels stack in the intended order.
5. Test filter behavior:
   - date range changes query and refetches summary/table blocks;
   - status menu maps to assignment/AP/grade/risk/overdue query;
   - reset clears to current month and `all`.
6. Test export link:
   - URL points to `/api/dashboard/export?scope=am` with active query.
7. Capture screenshots if useful for review.
8. Stage only AM dashboard files and the AM plan files when user approves commit.

## Success Criteria

- [ ] Lint passes.
- [ ] Build passes.
- [ ] Desktop matches AM mockup at structure level.
- [ ] Mobile has no horizontal overflow.
- [ ] QAM/Admin/SM dashboards still render.
- [ ] Handoff clearly lists any backend/runtime issue found during verification.

## Risk Assessment

If AM account/data is unavailable, complete static and visual verification with the current role constraints noted. Do not fake dashboard data to make the screen look populated.
