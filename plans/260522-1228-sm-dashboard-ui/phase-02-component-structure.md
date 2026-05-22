---
phase: 2
title: Component Structure
status: completed
priority: P1
effort: 0.5d
---

# Phase 2: Component Structure

## Overview

Tach SM dashboard thanh cac component nho de sau nay cac role dashboard con lai co the tai su dung pattern ma khong lam `dashboard/page.tsx` phinh to.

## Requirements

- Functional: DashboardPage chi chon role view va pass data/filter.
- Non-functional: file de doc, component co trach nhiem ro, khong tao abstraction qua som.

## Architecture

```txt
src/app/(dashboard)/dashboard/page.tsx
  -> SmFilterBar
  -> SmDashboardView

src/features/dashboard/components/
  -> sm-dashboard.tsx
  -> sm-filter-bar.tsx
  -> sm-kpi-row.tsx
  -> sm-audit-history-panel.tsx
  -> sm-severity-panel.tsx
  -> sm-score-trend-panel.tsx
  -> sm-action-plan-update-panel.tsx
  -> sm-evidence-panel.tsx
```

## Related Code Files

- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify/Create: `src/features/dashboard/components/sm-*.tsx`
- Reuse: dashboard primitives hien co trong `src/features/dashboard/components/`

## Implementation Steps

1. Giu `DashboardPage` lam router theo role:
   - `scope === "sm"` render `SmFilterBar` + `SmDashboardView`.
   - QAM/Admin giu behavior hien tai.
2. Tach SM view thanh cac panel rieng.
3. Tai su dung KPI/panel/list primitives hien co neu hop style.
4. Neu primitive hien co lam UI lech mockup, tao helper local trong SM component truoc; chi promote len shared khi co role thu hai can dung.
5. Dam bao event click row/action khong gay side effect ngoai navigate.

## Success Criteria

- [ ] `page.tsx` khong bi nhhoi logic render chi tiet SM.
- [ ] Moi panel SM co file/section rieng, ten ro nghia.
- [ ] Component khong phu thuoc mock data.
- [ ] QAM/Admin dashboard khong doi.

## Risk Assessment

- Risk: tach qua nhieu file lam overengineering. Mitigation: chi tach cac panel lon, helper nho co the de cung file neu ngan.
- Risk: shared primitive cu khong hop mockup. Mitigation: uu tien UI dung mockup cho SM, sau do moi tong quat hoa.
