---
phase: 2
title: "AM dashboard data wiring"
status: completed
priority: P1
effort: "0.5d"
dependencies: [1]
---

# Phase 2: AM dashboard data wiring

## Overview

Add AM-specific filter/query wiring so `/dashboard` calls the correct BE contract and exposes options needed by the AM filter bar.

## Requirements

- Functional: AM dashboard calls `/api/dashboard/am` with AM filters and `/api/dashboard/filters?scope=am`.
- Functional: Export link uses `/api/dashboard/export?scope=am` with the same filter query.
- Non-functional: no client-side business aggregation; FE only formats fields returned by BE.

## Architecture

Add AM filter types and query helpers parallel to QAM/Admin/SM. `DashboardPage` owns AM filter state and passes summary/charts/tables to `AmDashboardView`.

## Related Code Files

- Modify: `src/features/dashboard/types.ts`
- Modify: `src/features/dashboard/utils.ts`
- Modify: `src/features/dashboard/api.ts`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Create: AM component files under `src/features/dashboard/components/`

## Implementation Steps

1. Add `AmStatusFilter` and `AmDashboardFilters`.
   - Include `all`, assignment statuses, AP statuses, grades, `risk`, and `overdue`.
2. Add `getAmQueryParams(filters)` that maps grouped UI status to BE query params:
   - `assignment:*` -> `assignmentStatus`
   - `ap:*` -> `actionPlanStatus`
   - `grade:*` -> `grade`
   - `risk` -> `riskOnly=true`
   - `overdue` -> `overdueOnly=true`
3. Update `useDashboardData` to accept AM filters and use them when `scope === "am"`.
4. Update `useDashboardFilterOptions` so it fetches options for AM.
5. Update `DashboardPage`:
   - initialize AM filters with current month `from/to` and `statusMode: "all"`;
   - render `AmFilterBar` when `scope === "am"`;
   - render `AmDashboardView` instead of the generic role section for AM.
6. Ensure `RoleDashboardSections` does not duplicate AM content after `AmDashboardView` renders.

## Success Criteria

- [ ] AM scope fetches `/dashboard/am` with correct query params.
- [ ] AM filter options load from `scope=am`.
- [ ] Reset returns AM filters to current month and `all`.
- [ ] Export URL preserves active AM filters.

## Risk Assessment

The main regression risk is changing shared `useDashboardData` signature. Keep the update additive and preserve existing QAM/Admin/SM query behavior.
