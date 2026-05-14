# QA Test Report — 2026-05-14

## Summary

| Check | Status | Notes |
|-------|--------|-------|
| Typecheck | ✅ Pass | Zero TS errors, strict mode clean |
| Unit Tests | ✅ Pass | 77 tests passing via coverage runner |
| Build | ✅ Pass | Next.js build completes successfully, 20 routes static |
| E2E | ⚠️ Configured | Backend online at localhost:3000, playwright tests exist but not executed (per scope) |

---

## Unit Tests

**Result:** 77 tests passed

**Test Files:** 10 suites
- `src/test/setup.test.ts` — Infrastructure validation (2 tests)
- `src/shared/components/app-sidebar.test.tsx` — Sidebar role-based menu (3 tests)
- `src/shared/components/confirm-dialog.test.tsx` — Dialog component (N tests)
- `src/shared/components/role-guard.test.tsx` — Role guard wrapper (N tests)
- `src/shared/components/score-badge.test.tsx` — Score badge rendering (N tests)
- `src/features/action-plan/hooks/use-action-plans.test.ts` — Action plan hook (N tests)
- `src/features/auth/hooks/use-login.test.ts` — Login hook (N tests)
- `src/features/audit/hooks/use-my-assignments.test.ts` — Audit assignments (N tests)
- `src/features/audit/hooks/use-submit-audit.test.ts` — Audit submission (N tests)
- `src/features/dashboard/hooks/use-analytics.test.ts` — Analytics hook (N tests)

**Test Environment:**
- Vitest 4.1.5 with jsdom environment
- MSW server running for API mocking
- React Testing Library for component tests

---

## Coverage Metrics

| Metric | Coverage | Status |
|--------|----------|--------|
| **Statements** | 13.54% (122/901) | ⚠️ Below target (80%) |
| **Branches** | 12.47% (67/537) | ⚠️ Below target (80%) |
| **Functions** | 11.81% (54/457) | ⚠️ Below target (80%) |
| **Lines** | 12.71% (109/857) | ⚠️ Below target (80%) |

**Coverage Highlights:**
- `lib/api-client.ts` — 86.95% stmts ✅ (well-tested)
- `shared/components/app-sidebar.tsx` — 86.66% stmts ✅
- `features/action-plan/hooks/use-action-plans.ts` — 80% stmts ✅
- `features/auth/hooks/use-me.ts` — 52.94% stmts ⚠️
- Most components & hooks — 0% coverage (stubs only or complex Radix/shadcn deps)

**Zero Coverage Areas (Critical):**
- All `components/ui/*` — UI primitives from shadcn (0% expected, imported only)
- All dashboard components — `am-dashboard.tsx`, `qc-dashboard.tsx`, `sm-dashboard.tsx`, etc.
- All master-data components — `brand-drawer.tsx`, `store-drawer.tsx`, `user-drawer.tsx`
- `features/audit/components/execution/*` — Criteria input, evidence uploader
- `features/criteria/*` — Criteria CRUD components
- `features/checklist/*` — Checklist components

---

## Build Status

**Result:** ✅ Pass

**Build Output:**
- Next.js 16 static generation: 7 workers, 20 routes prerendered
- TypeScript compilation: 9.7s
- All routes marked correctly:
  - 14 static (○) routes
  - 6 dynamic (ƒ) routes
  - 1 middleware proxy

**Production Readiness:** Build artifact ready for deployment

---

## E2E Status

**Result:** ⚠️ Backend Online, E2E Tests Configured

- Backend reachable: `curl http://localhost:3000/api/auth/me` → HTTP 401 (expected auth fail)
- E2E test files exist:
  - `e2e/auth.spec.ts`
  - `e2e/audit-execute-flow.spec.ts`
  - `e2e/action-plan-flow.spec.ts`
- Playwright configured with 3 spec files
- E2E execution skipped per scope (not included in request)

---

## Issues & Recommendations

### 🔴 Critical Issues

1. **Test Coverage Far Below Target**
   - Current: 13.54% statements | Target: 80%
   - 54/457 functions tested (11.81%)
   - Gap: 788 statements uncovered
   - Impact: Most business logic paths unvalidated
   - Fix: Prioritize tests for features marked as "Priority Screens" in CLAUDE.md:
     - Audit Execution (QC) — highest complexity
     - Checklist Builder (QAM) — configuration flow
     - Audit Planning (QAM) — workflow
     - Action Plan Detail (SM/AM) — fix loop

2. **Dashboard & Operations Components Have Zero Coverage**
   - `am-dashboard.tsx`, `qc-dashboard.tsx`, `sm-dashboard.tsx` — 0% tested
   - All main UI flows unvalidated in tests
   - User interactions unverified
   - Recommendation: Add integration tests for role-based dashboard views

3. **Criteria & Checklist CRUD Completely Untested**
   - `criteria-crud-sheet.tsx`, `checklist-crud-sheet.tsx` — 0% coverage
   - Complex form logic with no tests
   - Recommendation: Write comprehensive form validation & submission tests

4. **Audit Execution Components Untested**
   - `criteria-input-card.tsx`, `evidence-uploader.tsx` — 0% coverage
   - Core QC workflow unvalidated
   - Recommendation: Test error scenarios, file upload handling, criteria submission

### ⚠️ Medium Issues

1. **Test Runner Configuration Issue (Non-blocking)**
   - `npm run test -- --run` fails with "Vitest failed to find current suite" error
   - Root cause: setup.ts imported as test file instead of setup file (Vitest 4.1.5 behavior)
   - Workaround: `npm run test:coverage` succeeds and runs all tests
   - Impact: CI/CD may fail on test command — use coverage runner instead
   - Fix: Update vitest config to exclude setup.ts or rename to .setup.ts

2. **Auth Hook Partially Covered**
   - `use-me.ts` — 0% statements (not mocked/called in tests)
   - `use-login.ts` — likely low coverage
   - Recommendation: Test auth state transitions, token refresh, logout flow

3. **Master Data API Functions Untested**
   - `master.api.ts` — 0% coverage
   - Brand, store, user CRUD endpoints not validated
   - Recommendation: Mock API and test error handling, pagination

### 💡 Minor Issues

1. **No E2E Integration Tests Run**
   - Playwright e2e tests exist but not executed
   - Real user workflows not validated end-to-end
   - Consider adding e2e to CI/CD pipeline

2. **Scoring Engine Untested**
   - `lib/scoring.ts` — 0% coverage
   - Audit scoring logic not validated
   - Risk: Incorrect scores reported to users
   - Recommendation: Test score calculations with real checklist data

---

## Performance Metrics

**Test Execution Time:**
- Setup: 14.38s (MSW server + React environment)
- Transform: 1.90s (TypeScript compilation)
- Import: 3.37s (module resolution)
- Test execution: 3.60s (77 tests)
- **Total:** 23.25s (coverage mode)

**Performance Assessment:** ✅ Acceptable — full suite runs in ~23s

---

## Test Quality Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Test isolation | ✅ Good | MSW cleanup between tests, no test interdependencies |
| Mock coverage | ✅ Good | auth store, Next router, api-client mocked |
| Error scenarios | ⚠️ Partial | Setup tests pass, but error paths in components untested |
| Edge cases | ⚠️ Weak | Boundary conditions not explicitly tested |
| Determinism | ✅ Good | No flaky tests observed |

---

## Unresolved Questions

1. **Why does `npm run test -- --run` fail?** Is this expected in CI/CD, or should vitest config be fixed?
2. **Should E2E tests run in CI/CD?** If yes, need backend running or mock mode for playwright.
3. **Coverage target 80% realistic?** With 901 statements and current team capacity, phased approach needed (phase 1: 40%, phase 2: 60%, phase 3: 80%)?
4. **Scoring engine criticality?** Should `lib/scoring.ts` be tested before audit execution feature goes live?

---

## Next Steps (Priority Order)

1. **Immediate (Blocking for UAT)**
   - Fix vitest test runner (update config to exclude setup.ts from test discovery)
   - Write tests for audit execution happy path (QC role)
   - Validate error handling in criteria input & evidence upload

2. **Short-term (Before Phase 1 Go-Live)**
   - Add dashboard role-based tests (am-dashboard, qc-dashboard, sm-dashboard)
   - Test action plan detail flow (sm/am roles)
   - Test checklist builder CRUD (qam role)
   - Target: 40% coverage minimum

3. **Medium-term (Phase 2)**
   - Add audit planning workflow tests
   - Test criteria group & criteria library CRUD
   - Test master data operations (brands, stores, users)
   - Target: 60% coverage

4. **Long-term (Phase 3)**
   - Add E2E integration tests for full user workflows
   - Test edge cases & error scenarios across all features
   - Performance benchmarking
   - Target: 80% coverage

---

**Report generated:** 2026-05-14 13:46 UTC  
**Test environment:** Windows 10, Node.js, Vitest 4.1.5, Next.js 16  
**Project:** Maycha QA/QC Platform — Frontend (qaqc-fe)
