# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Local dev server, default http://localhost:3001
npm run check        # lint + typecheck + build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest (once); test:watch (watch); test:coverage (coverage)
npm run test:e2e     # Playwright headless; test:e2e:headed / test:e2e:ui
```

Single test file:
```bash
npx vitest run src/features/audit/hooks/use-audit-execution.test.ts
```

## Architecture

**Feature-based structure** — all domain logic in `src/features/{domain}/`:
```
features/{domain}/
├── api/{domain}.api.ts    # API calls via apiClient — only way to call backend
├── hooks/                 # TanStack Query hooks (queries + mutations)
├── components/            # React components
└── index.ts               # Public exports
```

Active feature domains: `auth`, `master-data`, `criteria`, `checklist`, `audit`, `notifications`.

**Shared layer** (`src/shared/`):
- `types/index.ts` — source of truth for all TS interfaces. Add only, never rename/remove existing fields.
- `components/` — `DataTable`, `SortableTable`, `FormDrawer`, `RoleGuard`, `ScoreBadge`, `StatusBadge`, `PaginationControls`, `PageHeader`, `MetricCard`, `SearchInput`, `EmptyState`, `ConfirmDialog`, `RowActions`, `ComboboxInput`, `GlobalLoadingBar`, `AppSidebar`, `NotificationPanel`.
- `api/upload.api.ts` — file upload only; never use `apiClient` for uploads.

**Core lib** (`src/lib/`):
- `api-client.ts` — native `fetch` wrapper; `credentials:"include"`; auto-redirects on 401. **Do not modify core logic.** All HTTP calls go here.
- `scoring.ts` — CHEP engine: RISK flag → score = 0; CCP flag → group score = 0; weighted avg across groups.
- `roles.ts` — `ROLE_LABELS` map, `hasRole()`, `useHasRole()` hook.
- `format.ts` — vi-VN locale: `formatDate()`, `formatDateTime()`, `formatScore()`, `formatGrade()`.
- `build-qs.ts` — `buildQS(params)`: object → query string, filters undefined.
- `utils.ts` — `cn()`: clsx + tailwind-merge for conditional class merging.

**State** (`src/stores/`):
- `auth.store.ts` — Zustand + persist (key: `"maycha_auth"`). Holds `user`, `activeRole`, `availableRoles`. Auth token is httpOnly cookie `maycha_at` — never in JS.
- `ui.store.ts` — `sidebarOpen`, `loadingCount` (drives GlobalLoadingBar), `notificationCount`.
- `checklist-builder.store.ts` — checklist builder draft state.
- Route protection via `<RoleGuard roles={[...]}>`.

**App Router** (`src/app/`):
- `(auth)/login` — public
- `(dashboard)/dashboard` — role-routed to 6 role dashboards
- `(dashboard)/master-data/organization` — brands + stores CRUD
- `(dashboard)/master-data/users` — user + role management
- `(dashboard)/master-data/import` — bulk import
- `(dashboard)/qam/criteria-groups` + `qam/criteria` — criteria library
- `(dashboard)/qam/checklists` + `qam/checklists/[id]` — checklist builder
- `(dashboard)/qam/audit-plans` + `qam/audit-plans/new` + `qam/audit-plans/[id]` — audit planning
- `(dashboard)/qc/my-assignments` — QC auditor assignment list
- `(dashboard)/qc/audits/[assignmentId]` — QC audit execution (most complex page)
- `(dashboard)/audits` + `audits/[id]` — audit results list + detail (QAM/admin view)
- `(dashboard)/action-plans` + `action-plans/[id]` — action plans list + remediation detail

**Route-local `_lib/` pattern** — complex pages keep pure logic modules inside `_lib/`:
- `qc/audits/[assignmentId]/_lib/violations-reducer.ts` — `useReducer` state for violation edits
- `qc/audits/[assignmentId]/_lib/build-virtual-sections.ts` — creates virtual CCP/RISK tabs from checklist sections
- `qc/audits/[assignmentId]/_lib/derive-progress.ts` — computes completion % from violations state

## Audit Execution State (Key Complexity)

The QC audit execute page (`qc/audits/[assignmentId]`) manages complex local state:
- `useReducer(violationsReducer, {})` — violations keyed by `criteriaId`; dispatches: `SET_ERRORS`, `SET_NOTE`, `ADD_IMAGE`, `REMOVE_IMAGE`, `RESTORE`
- Draft auto-saves on a 1500ms debounce via `useSaveDraft` mutation
- On load, restores existing violations from `AuditSession.audit.violations` (guarded by `isRestored` ref to prevent double-restore)
- `buildVirtualSections()` appends synthetic "CCP violations" and "RISK violations" tabs
- `isReadOnly` is true when plan window closed or assignment already `completed`

## Key Constraints

- **Backend:** browser calls relative `/api` and `/uploads`; Next rewrites to `BE_INTERNAL_URL` server-side. Responses always `{ success: true, data: T }`. Paginated lists include `meta`.
- **API:** use `apiClient.get/list/post/patch/put/delete`. `list<T>()` returns `{ data: T[], meta: PaginationMeta }`.
- **File upload:** `src/shared/api/upload.api.ts` only — NOT `apiClient`.
- **Colors:** CSS variables only (`--primary`, `--success`, `--destructive`, `--warning`) — no hardcoded hex.
- **File size:** ≤ 200 lines; split into focused modules when approaching limit.
- **Named exports only** — no default exports for components.
- **No `any`** — use specific types or `unknown` + type guard.
- **`src/shared/types/index.ts`** — add-only; never rename or remove existing fields.

## TanStack Query Conventions

Query key patterns:
- List: `["resource-name"]`
- Filtered list: `["resource-name", "filter", value]`
- Detail: `["resource-name", id]`

Default `staleTime: 30_000`. Conditional queries use `enabled: !!id`. Mutations invalidate with `queryClient.invalidateQueries`.

## Testing Infrastructure

- **Unit:** Vitest + React Testing Library. MSW handlers in `src/test/handlers/`.
- **E2E:** Playwright in `e2e/`. Config in `playwright.config.ts`.
- Test philosophy: test user behavior, not implementation details.

## Docs

- `docs/system-architecture.md` — overall architecture + role/scoring details
- `docs/code-standards.md` — color palette, TS rules, responsive breakpoints
- `docs/BUILD_PLAN.md` — vertical-slice feature status
