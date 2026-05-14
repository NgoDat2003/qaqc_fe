# Project Changelog — QA/QC Frontend

---

## [Phase 1] 2026-05-14 — BE Alignment & Dashboard Implementation

### New Features
- **ActionPlanStatus** updated: removed `in_progress` & `confirmed`, added `rejected` status
  - New flow: `draft → submitted → rejected (resubmit) → submitted → closed`
- **6 Role Dashboards** fully implemented:
  - CA Dashboard (`ca-dashboard.tsx`)
  - QAM Dashboard (`qam-dashboard.tsx`)
  - QC Dashboard (`qc-dashboard.tsx`)
  - AM Dashboard (`am-dashboard.tsx`)
  - SM Dashboard (`sm-dashboard.tsx`)
  - EV Dashboard (`ev-dashboard.tsx`)
- **Full System Dashboard** utility component (`full-system-dashboard.tsx`) for comprehensive analytics

### New Hooks
- `useReviewActionPlan()` — QAM action plan review workflow
- `useAnalyticsOverview()` — dashboard statistics aggregation
- `useMyAssignments()` — QC auditor assignment list

### New Components
- `RepeatInfoDisplay` — render repeat/CCP/RISK indicators
- `CriteriaInputCard` — criterion input UI with error tracking
- `AuditResultView` — score breakdown & violations display
- `FullSystemDashboard` — analytics dashboard shell
- `APStatusBadge` — action plan status visual indicator

### New API Modules
- `src/features/analytics/api/analytics.api.ts` — dashboard endpoints

### UI/UX Improvements
- Execute audit page: full interactive implementation with evidence upload
- My Audits page: listing & filtering completed audits
- Dashboard navigation: role-based view switching

### Documentation
- Updated `system-architecture.md`:
  - Added Action Plan status machine diagram
  - Listed all 6 dashboard components with status
- Created `project-changelog.md`

### Breaking Changes
- None (ActionPlanStatus change is BE-driven)

---

## Older Releases

(None — Phase 1 is initial release)
