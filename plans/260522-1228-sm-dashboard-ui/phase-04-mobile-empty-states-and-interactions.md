---
phase: 4
title: Mobile Empty States And Interactions
status: completed
priority: P2
effort: 0.5d
---

# Phase 4: Mobile Empty States And Interactions

## Overview

Polish responsive behavior, valid empty states, and navigation interactions so the dashboard is usable when SM opens on mobile or when data is naturally empty.

## Requirements

- Functional: filter works, links navigate, no action mutates data.
- Non-functional: no horizontal overflow, text/badges/buttons not clipped.

## Architecture

Mobile stack:

```txt
Filter
KPI cards
Audit History
Severity
Score Trend
Action Plan
Evidence
```

## Related Code Files

- Modify: `src/features/dashboard/components/sm-*.tsx`
- Potential reuse: existing responsive classes and upload image helpers.

## Implementation Steps

1. Convert desktop tables to compact mobile rows where table columns would squeeze.
2. Ensure KPI cards use 1 column on very narrow screens and 2 columns where safe.
3. Define empty states:
   - No AP: `Chua co Action Plan can cap nhat trong bo loc hien tai.`
   - No evidence: `Chua co minh chung khac phuc trong bo loc hien tai.`
   - No errors: `Cua hang chua phat sinh loi trong bo loc hien tai.`
   - No trend: `Chua du du lieu xu huong diem.`
4. Add guarded click handlers:
   - Audit row only navigates if `auditId`.
   - AP row only navigates if `actionPlanId`.
   - Evidence thumbnail navigates only if `actionPlanId`.
5. Ensure filter reset/refresh preserves SM route and refetches query.

## Success Criteria

- [ ] Mobile `390x844` khong overflow ngang.
- [ ] Empty states dung ngu canh, khong hien "Cho du lieu BE" khi data rong hop le.
- [ ] Buttons/links bam duoc, khong trigger nham parent row.
- [ ] Closed/submitted AP khong co action submit/close tren dashboard.

## Risk Assessment

- Risk: mobile filter cao qua. Mitigation: compact controls, stack theo 2 columns only when enough width.
- Risk: long checklist/AP text lam vo card. Mitigation: wrap/truncate co gioi han.
