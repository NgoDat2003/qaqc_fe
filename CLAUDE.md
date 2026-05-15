# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3001
npm run check        # Full check: lint + typecheck + build
npm run typecheck    # tsc type check only
npm run lint         # ESLint
npm run test         # Vitest unit tests (watch: test:watch, coverage: test:coverage)
npm run test:e2e     # Playwright headless (headed: test:e2e:headed, ui: test:e2e:ui)
```

Run a single test file:
```bash
npx vitest run src/features/audit/hooks/use-audit-execute.test.ts
```

## Architecture

**Feature-based structure:** all domain logic lives in `src/features/{domain}/` with the pattern:
```
features/{domain}/
├── api/{domain}.api.ts    # API calls via apiClient — the ONLY way to call the backend
├── hooks/                 # TanStack Query hooks (queries + mutations)
└── components/            # React components for this domain
```

**Shared layer** (`src/shared/`):
- `types/index.ts` — **single source of truth** for all TypeScript interfaces (~378 lines). Only add, never break.
- `components/` — reusable UI: `DataTable`, `FormDrawer`, `RoleGuard`, `ScoreBadge`, `StatusBadge`, `PaginationControls`, `PageHeader`, `MetricCard`, `SearchInput`, `EmptyState`, `ConfirmDialog`, `RowActions`.
- `api/upload.api.ts` — file upload; never use `apiClient` for uploads.

**Core lib** (`src/lib/`):
- `api-client.ts` — axios instance with interceptors, `credentials: "include"`, auto-redirects on 401. **All HTTP calls must go through here.**
- `build-qs.ts` — query string builder for paginated/filtered API requests.
- `scoring.ts` — CHEP scoring engine. Key rules: RISK flag → audit score = 0; CRITICAL flag → group score = 0; weighted average across groups.
- `roles.ts` — permission helpers for 6 roles: `company_admin`, `qa_manager`, `qc_auditor`, `am`, `store_manager`, `executive_viewer`.

**State:**
- `src/stores/auth.store.ts` — Zustand + immer + persist. Stores `user`, `activeRole`, `availableRoles`. Auth token is httpOnly cookie `qo_token` (never in JS).
- `src/stores/ui.store.ts` — sidebar collapse, global UI state.
- Route protection via `<RoleGuard roles={[...]}>` wrapper.

**Feature domains** (`src/features/`): `auth`, `master-data`, `criteria`, `checklist`, `audit`, `action-plan`, `analytics`.

**App Router (`src/app/`):**
- `(auth)/login` — public route
- `(dashboard)/` — all protected routes, role-gated via RoleGuard
  - `master-data/organization` — brands + stores CRUD
  - `master-data/users` — user + role management
  - `operations/criteria` + `criteria/groups` — criteria library
  - `operations/checklists` + `checklists/new` + `checklists/[id]` — checklist builder
  - `operations/audit-plans` — create & list audit plans
  - `operations/audits/[id]/execute` — QC audit execution
  - `operations/my-audits` — QC assignment list *(stub)*
  - `operations/action-plan` + `action-plan/[id]` — action plan CRUD
  - `dashboard` — role-routed to 6 dashboards (CA/QAM/QC/AM/SM/EV)
  - `reports` — *(stub)*

## Key Constraints

- **Backend:** runs on port 3000, set via `NEXT_PUBLIC_BE_URL`. API responses always `{ success: true, data: T }`.
- **File upload:** use `src/shared/api/upload.api.ts` — NOT `apiClient.post`.
- **Colors:** use CSS variables (`--primary`, `--success`, `--destructive`, `--warning`) — no hardcoded hex values.
- **File size:** keep files under 200 lines; split into focused components when approaching that limit.
- **File naming:** kebab-case, descriptive enough that purpose is clear from name alone.
- **Commits:** never on `main` — always create `feat/`, `fix/`, `chore/`, `refactor/`, or `test/` branch first.

## Testing Infrastructure

- **Unit/integration:** Vitest + React Testing Library. MSW handlers in `src/test/handlers/`.
- **E2E:** Playwright in `e2e/`. Config in `playwright.config.ts`.
- Do not mock to cheat — fix failing tests before merging.

## Docs

- `docs/system-architecture.md` — overall architecture
- `docs/code-standards.md` — color palette, TypeScript rules, responsive breakpoints
- `docs/BUILD_PLAN.md` — vertical-slice approach and feature status
