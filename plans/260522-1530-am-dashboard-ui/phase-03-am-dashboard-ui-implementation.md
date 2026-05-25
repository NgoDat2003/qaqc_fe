---
phase: 3
title: "AM dashboard UI implementation"
status: completed
priority: P1
effort: "1.5d"
dependencies: [2]
---

# Phase 3: AM dashboard UI implementation

## Overview

Implement the AM dashboard UI to match the provided mockup while reusing dashboard core primitives and keeping components small.

## Requirements

- Functional: render KPI cards, store ranking, error donut, score trend, AP by store, and top criteria from BE data.
- Functional: links route to existing app pages.
- Non-functional: responsive, no horizontal overflow, file sizes kept manageable through focused components.

## Architecture

Compose `AmDashboardView` from role-specific panels:

- `AmKpiRow`
- `AmFilterBar`
- `AmStoreRankingPanel`
- `AmErrorGroupPanel`
- `AmScoreTrendPanel`
- `AmActionPlanByStorePanel`
- `AmTopCriteriaPanel`

Reuse existing shared primitives for panel shell, KPI visual language, link styling, empty states, progress bars, donut/line chart drawing, and formatting helpers.

## Related Code Files

- Create: `src/features/dashboard/components/am-dashboard.tsx`
- Create: `src/features/dashboard/components/am-filter-bar.tsx`
- Create: focused AM panel/helper components under `src/features/dashboard/components/`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/features/dashboard/types.ts`, `utils.ts`, `api.ts`

## Implementation Steps

1. Build `AmKpiRow` with 5 cards matching mockup:
   - average area score: `summary.averageScore`
   - audited stores: `summary.auditedStoreCount / summary.managedStoreCount`
   - Risk/CCP/F-CCP: `riskViolationCount / ccpViolationCount / autoCcpViolationCount`
   - AP open: `summary.actionPlanOpen`
   - AP overdue: `summary.actionPlanOverdue`
2. Build `AmFilterBar`:
   - date range, brand, store, status audit/AP, reset, export.
   - include checklist/audit plan only if needed by available options without overcrowding the mockup layout; otherwise keep them available in code for later expansion.
3. Build `AmStoreRankingPanel`:
   - segmented tabs: `Diem cao nhat` and `Diem thap nhat`.
   - use `tables.topStores` and `tables.bottomStores`.
   - show store name/code, average score/latest score, latest audit date, and link to store/audit list.
4. Build `AmErrorGroupPanel`:
   - donut from `charts.errorsByGroup`.
   - legend uses C/H/P/E/RISK labels with count and percentage.
5. Build `AmScoreTrendPanel`:
   - line chart from `charts.scoreTrend`.
   - preserve score `0` as a valid point.
   - render empty state if fewer than one point.
6. Build `AmActionPlanByStorePanel`:
   - rows from `tables.actionPlansByStore`.
   - columns: store, open, overdue, closed; include max overdue days as danger meta.
7. Build `AmTopCriteriaPanel`:
   - rows from `tables.topCriteria`.
   - show criteria code/name, group code, and error count.
8. Add navigation links:
   - stores/organization: `/master-data/organization`
   - audits: `/audits`
   - action plans: `/action-plans`
   - criteria: `/qam/criteria`
9. Mobile:
   - stack KPI, ranking, error/trend, AP/top criteria.
   - avoid nested cards and horizontal tables.

## Success Criteria

- [ ] Desktop `1440x1000` visually matches the AM mockup structure.
- [ ] Mobile `390x844` has no horizontal overflow.
- [ ] All displayed numbers come from BE response fields.
- [ ] Empty states are explicit and do not look broken.
- [ ] AM file/component structure remains reusable for QC dashboard later.

## Risk Assessment

The mockup is dense. Keep the first implementation focused on matching layout and hierarchy; avoid adding extra analytics panels not present in the AM mockup.
