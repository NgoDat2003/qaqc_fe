---
phase: 3
title: Mockup Layout Implementation
status: completed
priority: P1
effort: 1d
---

# Phase 3: Mockup Layout Implementation

## Overview

Implement desktop UI giong mockup SM: header/filter, 5 KPI cards, middle row 3 panel, bottom row 2 panel.

## Requirements

- Functional: hien dung data BE cho tung block.
- Non-functional: dense dashboard, card radius <= 8px, palette teal/navy/semantic, khong card long card.

## Architecture

Desktop grid:

```txt
Header + Filter
KPI x 5
[Audit History 2fr][Severity 0.8fr][Score Trend 1fr]
[Action Plan 1.4fr][Evidence 1fr]
```

## Related Code Files

- Modify: `src/features/dashboard/components/sm-dashboard.tsx`
- Create/Modify: `src/features/dashboard/components/sm-*.tsx`
- Reuse: existing `Button`, status badge, icon style, dashboard panel styles.

## Implementation Steps

1. Header/filter:
   - Title: `Dashboard cua hang SM`.
   - Subtitle: `Tong quan chat luong va Action Plan`.
   - Controls: time range, checklist, action plan status, refresh, export.
2. KPI row:
   - Diem gan nhat: `summary.latestScore`.
   - Diem trung binh ky: `summary.averageScore`.
   - AP dang mo: `summary.actionPlanOpen`.
   - AP qua han: `summary.actionPlanOverdue`.
   - Minh chung khac phuc: `summary.remediationEvidenceRate`, `evidenceCount/requiredEvidenceCount`.
3. Audit history panel:
   - Columns: ngay audit, checklist, diem, ket qua.
   - Row click: `/audits/:auditId`.
   - Link: `Xem tat ca lich su` -> `/audits`.
4. Severity panel:
   - 4 row: Risk, CCP, F-CCP, Loi thuong.
   - Use `charts.violationSeverityBreakdown`.
5. Score trend:
   - Build mini SVG line chart from `charts.scoreTrend[]`.
   - Use `averageScore` for Y, `label` for X.
   - If <2 points, render compact single value state.
6. Action Plan panel:
   - Columns: AP/Viec, Han xu ly, Trang thai, Qua han.
   - Use `criteria.name || issueCause`.
   - Use `deadline`, `actionPlanStatus`, `overdueDays`.
   - Row click: `/action-plans/:actionPlanId`.
7. Evidence panel:
   - Progress bar from evidence counts.
   - Thumbnail strip from `latestRemediationImages`.
   - Click thumbnail/item: prefer `/action-plans/:actionPlanId` when present.

## Success Criteria

- [ ] Desktop first viewport visually matches mockup structure.
- [ ] Line chart is not a bar chart.
- [ ] Severity panel is row-based like mockup.
- [ ] AP panel and Evidence panel share bottom row.
- [ ] All values come from BE response.

## Risk Assessment

- Risk: image thumbnail broken if BE returns relative upload URL. Mitigation: use existing upload URL resolver/proxy behavior.
- Risk: export returns CSV and browser handling differs. Mitigation: implement simple anchor/download behavior with current query.
