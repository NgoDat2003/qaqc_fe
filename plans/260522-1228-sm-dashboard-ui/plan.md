---
title: SM Dashboard Redesign Theo Mockup
description: ''
status: completed
priority: P2
branch: codex/sm-dashboard-ui-foundation
tags:
  - dashboard
  - sm
  - ui
  - mockup
blockedBy: []
blocks: []
created: '2026-05-22T07:15:57.215Z'
createdBy: 'ck:plan'
source: skill
---

# SM Dashboard Redesign Theo Mockup

## Overview

Lam lai dashboard role `store_manager` theo dung mockup "Dashboard cua hang SM": filter compact, KPI row 5 card, lich su audit, severity Risk/CCP/F-CCP, line chart xu huong diem, Action Plan can cap nhat va minh chung khac phuc.

BE contract hien da du de implement bang data that theo `D:/work/maycha/qaqc-build/qaqc-be/docs/dashboard-sm-fe-handoff.md`. Khong mock so lieu, khong sua BE trong scope FE nay.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [API Contract And Data Mapping](./phase-01-api-contract-and-data-mapping.md) | Completed |
| 2 | [Component Structure](./phase-02-component-structure.md) | Completed |
| 3 | [Mockup Layout Implementation](./phase-03-mockup-layout-implementation.md) | Completed |
| 4 | [Mobile Empty States And Interactions](./phase-04-mobile-empty-states-and-interactions.md) | Completed |
| 5 | [Validation And Review](./phase-05-validation-and-review.md) | Completed |

## Dependencies

- Base branch: `codex/role-dashboard-ui-foundation`
- Working branch: `codex/sm-dashboard-ui-foundation`
- BE endpoint: `GET /api/dashboard/sm`
- Filter endpoint: `GET /api/dashboard/filters?scope=sm`
- Export endpoint: `GET /api/dashboard/export?scope=sm`

## Design Target

- Desktop first viewport phai bam sat anh mockup user cung cap.
- Mobile stack dep, khong horizontal overflow.
- Dashboard chi dieu huong/doc data, khong submit/close AP truc tiep.

## Out Of Scope

- Khong redesign Admin/QAM/QC/AM dashboard trong task nay.
- Khong doi API BE.
- Khong them chart library moi neu SVG/CSS noi bo du dung.
- Khong fake data de lam dep UI.
