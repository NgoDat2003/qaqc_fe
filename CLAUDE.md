# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3001
npm run check        # lint + typecheck + build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest (once); test:watch (watch); test:coverage (coverage)
npm run test:e2e     # Playwright headless; test:e2e:headed / test:e2e:ui
```

Single test file:
```bash
npx vitest run src/features/audit/hooks/use-audit-execute.test.ts
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

Active feature domains: `auth`, `master-data`, `criteria`, `checklist`, `audit`.

**Shared layer** (`src/shared/`):
- `types/index.ts` — source of truth for all TS interfaces. Add only, never rename/remove existing fields.
- `components/` — `DataTable`, `SortableTable`, `FormDrawer`, `RoleGuard`, `ScoreBadge`, `StatusBadge`, `PaginationControls`, `PageHeader`, `MetricCard`, `SearchInput`, `EmptyState`, `ConfirmDialog`, `RowActions`, `ComboboxInput`, `GlobalLoadingBar`, `AppSidebar`.
- `api/upload.api.ts` — file upload only; never use `apiClient` for uploads.

**Core lib** (`src/lib/`):
- `api-client.ts` — native `fetch` wrapper; `credentials:"include"`; auto-redirects on 401. All HTTP calls go here.
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
- `(dashboard)/qc/my-assignments` — QC assignment list

## Key Constraints

- **Backend:** port 3000 via `NEXT_PUBLIC_BE_URL`. Responses always `{ success: true, data: T }`. Paginated lists include `meta`.
- **API:** use `apiClient.get/list/post/patch/put/delete`. `list<T>()` returns `{ data: T[], meta: PaginationMeta }`.
- **File upload:** `src/shared/api/upload.api.ts` only — NOT `apiClient`.
- **Colors:** CSS variables only (`--primary`, `--success`, `--destructive`, `--warning`) — no hardcoded hex.
- **File size:** ≤ 200 lines; split into focused modules when approaching limit.
- **Named exports only** — no default exports for components.
- **No `any`** — use specific types or `unknown` + type guard.

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
