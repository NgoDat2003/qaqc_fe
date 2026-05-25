---
title: "AM Dashboard UI Foundation"
description: "Implement the AM role dashboard from the dashboard core branch using the updated BE handoff contract."
status: completed
priority: P2
branch: "codex/am-dashboard-ui-foundation"
tags: []
blockedBy: []
blocks: []
created: "2026-05-22T09:37:15.065Z"
createdBy: "ck:plan"
source: skill
---

# AM Dashboard UI Foundation

## Overview

Build the Area Manager dashboard on a dedicated branch from `codex/role-dashboard-ui-foundation`. The UI should match the approved AM mockup: KPI strip, scoped filters, store ranking, error group donut, 5-month score trend, Action Plan by store, and top failed criteria.

This plan is FE-only. BE contract is considered ready based on `D:/work/maycha/qaqc-build/qaqc-be/docs/dashboard-am-fe-handoff.md`; FE must not mock business numbers or recompute backend-owned metrics.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Branch and contract verification](./phase-01-branch-and-contract-verification.md) | Completed |
| 2 | [AM dashboard data wiring](./phase-02-am-dashboard-data-wiring.md) | Completed |
| 3 | [AM dashboard UI implementation](./phase-03-am-dashboard-ui-implementation.md) | Completed |
| 4 | [Browser verification and handoff](./phase-04-browser-verification-and-handoff.md) | Completed |

## Dependencies

- Source branch: `codex/role-dashboard-ui-foundation`
- Target feature branch: `codex/am-dashboard-ui-foundation`
- BE endpoint: `GET /api/dashboard/am`
- BE filters endpoint: `GET /api/dashboard/filters?scope=am`
- BE export endpoint: `GET /api/dashboard/export?scope=am`

## Key Decisions

- AM gets a dedicated `AmDashboardView` and `AmFilterBar`; do not extend `RoleDashboardSections` for the final AM UI.
- Reuse dashboard primitives where they fit: panel shell, KPI card styling, donut/line helpers, list/table compact patterns.
- AM trend uses BE `charts.scoreTrend` directly, which is intentionally independent from `from/to`.
- The `Risk / CCP / F-CCP` KPI uses violation counts: `riskViolationCount`, `ccpViolationCount`, `autoCcpViolationCount`.
- The store ranking tab uses `tables.topStores` and `tables.bottomStores`, not client-side sorting from the full table.
