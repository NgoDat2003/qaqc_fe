---
phase: 1
title: API Contract And Data Mapping
status: completed
priority: P1
effort: 0.5d
---

# Phase 1: API Contract And Data Mapping

## Overview

Chot mapping FE theo docs SM moi nhat, cap nhat types/query helper de dashboard dung dung data BE va khong phai doan schema.

## Requirements

- Functional: FE doc API fields cho KPI, charts, tables, filters, export.
- Non-functional: khong mock number, khong aggregate lai list lon o client.

## Architecture

Data flow:

```txt
DashboardPage
  -> useDashboardData(scope="sm", smFilters)
  -> GET /api/dashboard/sm
  -> SmDashboardView

SmFilterBar
  -> useDashboardFilterOptions(scope="sm")
  -> GET /api/dashboard/filters?scope=sm
```

## Related Code Files

- Modify: `src/features/dashboard/types.ts`
- Modify: `src/features/dashboard/utils.ts`
- Modify: `src/features/dashboard/api.ts`
- Read: `D:/work/maycha/qaqc-build/qaqc-be/docs/dashboard-sm-fe-handoff.md`

## Implementation Steps

1. Cap nhat `DashboardData` types de cover:
   - `charts.scoreTrend[]`: `label`, `date`, `averageScore`, `auditCount`.
   - `charts.errorsByGroup[]`: `groupCode`, `groupName`, `count`, `percentage`.
   - `charts.actionPlanStatus`: `draft`, `submitted`, `rejected`, `closed`.
   - `tables.actionPlanItemsToUpdate[]`: `deadline`, `overdueDays`, `actionPlanStatus`.
   - `tables.latestRemediationImages[]`: `actionPlanId`, `itemId`, `criteriaName`, `createdAt`.
2. Cap nhat `SmDashboardFilters`:
   - `from`, `to`, `checklistId`, `actionPlanStatus`, `grade`, `riskOnly`, `overdueOnly`.
3. Cap nhat query builder cho SM:
   - Khong gui param rong.
   - Export dung cung query filter hien tai.
4. Cap nhat filter option type cho `actionPlanStatuses`.
5. Giu QAM/Admin path khong doi.

## Success Criteria

- [ ] TypeScript co field can thiet cho toan bo SM mockup.
- [ ] `/api/dashboard/sm` query dung docs BE.
- [ ] `/api/dashboard/filters?scope=sm` doc/type du de render filter.
- [ ] Khong co fallback fake cho score/AP/evidence.

## Risk Assessment

- Risk: docs BE co tieng Viet encoding loi trong terminal. Mitigation: field names/type la source of truth, UI label FE tu dinh nghia.
- Risk: seed data rong trong local. Mitigation: UI empty state dung ngu canh, nhung validation mockup can dung analytics seed.
