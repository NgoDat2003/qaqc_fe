---
title: BE Phase 1 → FE Alignment
status: completed
priority: high
created: 2026-05-14
completed: 2026-05-14
blockedBy: []
blocks: []
---

# BE Phase 1 → FE Alignment

Align FE với backend PR #1. Backend đã stable (44/44 tests pass). FE có 4 nhóm việc chính cần fix/implement.

## Context

- BE handoff: 2026-05-14
- BE đã xong: audit submit, repeat tracking, action plan workflow, RBAC scope, analytics overview
- FE gap: types sai, AP workflow dùng status cũ, execute page là placeholder, dashboards là TODO stub

## Phases

| # | Phase | Status | Files chính |
|---|-------|--------|-------------|
| 1 | [Types + API Contract](phase-01-types-api-alignment.md) | ✅ done | `shared/types`, `api-client.ts`, `audit.api.ts`, `action-plan.api.ts` |
| 2 | [Action Plan Workflow Fix](phase-02-action-plan-workflow-fix.md) | ✅ done | `action-plan/hooks`, `action-plan/[id]/page.tsx` |
| 3 | [Audit Execute Flow](phase-03-audit-execute-flow.md) | ✅ done | `audit/hooks`, execute page, repeat-info component |
| 4 | [Analytics + Dashboards](phase-04-analytics-dashboards.md) | ✅ done | `dashboard/api`, `dashboard/hooks`, 6 dashboard components |

## Dependency Order

```
Phase 1 (types) → Phase 2 (AP fix) → Phase 3 (execute) → Phase 4 (dashboards)
```

Phase 1 phải xong trước — types sai sẽ block TypeScript compile ở các phase sau.

## Critical Constraints

- FE không tự filter RBAC — cứ gọi API, để BE chặn 403
- Không render `in_progress` hay `confirmed` AP status nữa
- Audit submit form không có input cho `repeatCount`
- Dashboard overview KHÔNG render cho user chỉ có role `qc_auditor` (BE trả 403)
