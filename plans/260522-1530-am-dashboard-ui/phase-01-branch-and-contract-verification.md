---
phase: 1
title: "Branch and contract verification"
status: completed
priority: P1
effort: "0.5d"
dependencies: []
---

# Phase 1: Branch and contract verification

## Overview

Create the AM dashboard feature branch from dashboard core and verify that FE will consume the updated AM handoff without guessing schemas.

## Requirements

- Functional: work starts from `codex/role-dashboard-ui-foundation` and continues on `codex/am-dashboard-ui-foundation`.
- Non-functional: do not touch BE source, `.codex/`, SM screenshots, or unrelated dirty files.

## Architecture

The dashboard route continues to resolve role scope through `scopeFromRole`. This phase only prepares the work area and locks the AM data contract before code changes.

## Related Code Files

- Read: `D:/work/maycha/qaqc-build/qaqc-be/docs/dashboard-am-fe-handoff.md`
- Read: `src/app/(dashboard)/dashboard/page.tsx`
- Read: `src/features/dashboard/types.ts`
- Read: existing QAM/Admin/SM dashboard component files for conventions.

## Implementation Steps

1. Confirm current branch is `codex/role-dashboard-ui-foundation`.
2. Create branch `codex/am-dashboard-ui-foundation`.
3. Confirm dirty files are unrelated and leave them untouched.
4. Re-read AM handoff and verify the required fields exist in the contract:
   - `summary.managedStoreCount`, `averageScore`, `auditedStoreCount`, `riskViolationCount`, `ccpViolationCount`, `autoCcpViolationCount`, `actionPlanOpen`, `actionPlanOverdue`.
   - `charts.errorsByGroup`, `charts.scoreTrend`, `charts.actionPlanStatus`.
   - `tables.topStores`, `tables.bottomStores`, `tables.actionPlansByStore`, `tables.topCriteria`.
   - filter options: brands, stores, checklists, auditPlans, actionPlanStatuses, assignmentStatuses, grades.
5. If runtime API is available, smoke-test login as AM and inspect `/api/dashboard/am` plus `/api/dashboard/filters?scope=am`; if credentials/server are unavailable, proceed from docs and note it in verification.

## Success Criteria

- [ ] Feature branch exists and is based on dashboard core.
- [ ] AM contract has no blocker for FE implementation.
- [ ] Any unavailable runtime verification is explicitly recorded for handoff.

## Risk Assessment

Main risk is implementing against docs that differ from runtime. Mitigate by running an API smoke test if the AM account and local BE are available before browser polish.
