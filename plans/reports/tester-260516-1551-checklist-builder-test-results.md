# Test Report: QAM Checklist Builder Improvements
**Branch:** feat/checklist-builder-improvements  
**Date:** 2026-05-16  
**Execution Time:** 7-10 minutes

---

## Test Results Overview

| Metric | Count | Status |
|--------|-------|--------|
| **Total Test Files** | 7 | ⚠️ 2 failed |
| **Total Tests** | 81 | ✅ 74 passed / 7 failed |
| **Test Pass Rate** | 91.4% | ⚠️ Below target |
| **Typecheck** | ✅ | Pass |
| **Lint Errors** | 2 | 🔴 Critical |
| **Lint Warnings** | 10 | ⚠️ Non-critical |

---

## Typecheck Result

**Status:** ✅ **PASS**

Command: `npm run typecheck`

Fixed an issue where Vitest global types were missing. Added `"types": ["vitest/globals"]` to `tsconfig.json` to resolve TypeScript errors for `afterEach`, `beforeAll`, etc. in test setup files.

---

## Test Execution Results

**Command:** `npm run test -- --run`

### Summary
- **Files Passed:** 5 ✅
  - src/shared/components/confirm-dialog.test.tsx
  - src/shared/components/pagination-controls.test.tsx
  - src/shared/components/role-guard.test.tsx
  - src/shared/components/score-badge.test.tsx
  - src/test/setup.test.ts

- **Files Failed:** 2 ❌
  - src/lib/api-client.test.ts (5 tests | 4 failed)
  - src/features/auth/hooks/use-login.test.ts (3 tests | 3 failed)

### Failed Tests (7 total)

#### 1. **src/lib/api-client.test.ts** — 4/5 failed

**Issue:** All failures are `Unauthorized` (401) responses instead of mocked responses.

| Test | Error | Root Cause |
|------|-------|-----------|
| returns { data, meta } when BE responds correctly | ApiClientError: Unauthorized | MSW handler not intercepting correctly |
| throws ApiClientError(500) when meta is missing | Expected 500, got 401 | MSW server not catching mocked responses |
| throws on 4xx/5xx — scenario #12 | Expected 500, got 401 | Request hitting real endpoint or MSW not active |
| still returns T directly (not ListResponse) | ApiClientError: Unauthorized | MSW handler issue |

**Passing Test:**
- ✅ throws ApiClientError(401) on 401 response (1/5)

**Analysis:** MSW server lifecycle hooks were misconfigured in vitest setup. The server starts globally, but per-test handler registration may not be executing properly. Request handlers `server.use()` calls in tests are not taking effect.

#### 2. **src/features/auth/hooks/use-login.test.ts** — 3/3 failed

| Test | Error | Assertion |
|------|-------|-----------|
| success → sets auth store with user and role | ApiClientError: Email and password are required | Expected mutation to succeed |
| wrong credentials → mutation errors | isError: false (expected true) | mutation.isError not reflecting error state |
| network error → mutation errors | isError: false (expected true) | mutation.isError not reflecting error state |

**Analysis:** TanStack Query mutation state not updating correctly when errors occur. The MSW mocking issue affects this test suite.

---

## Lint Report

**Command:** `npm run lint -- src/`

### Critical Errors (2)

#### 1. React Compiler Memoization — audit-plans page
```
src/app/(dashboard)/qam/audit-plans/page.tsx:50:27
  Error: Compilation Skipped: Existing memoization could not be preserved
  Reason: Inferred dependency `router` not in manual dependencies `[openClose]`
```
**Fix Required:** Add `router` to useMemo dependency array or use useCallback dependency correctly.

#### 2. Conditional Hook Call — checklist page
```
src/app/(dashboard)/qam/checklists/[id]/page.tsx:174:26
  Error: React Hook "useMemo" is called conditionally
  Reason: useMemo called after early return (violates rules of hooks)
```
**Fix Required:** Move all hooks to top level before any conditional returns.

### Warnings (10)

| File | Line | Warning | Severity |
|------|------|---------|----------|
| organization/page.tsx | 91 | 'isActive' never used | Minor |
| add-criteria-dialog.tsx | 26 | deps change every render | Medium |
| select-criteria-dialog.tsx | 43 | unused expression | Minor |
| criteria-group-drawer.tsx | 12 | 'DRAWER_SECTION_CLASS' unused | Minor |
| store-drawer.tsx | 61 | React Hook Form incompatible | Medium |
| api-client.test.ts | 1 | 'beforeEach' never used | Minor |
| api-client.ts | 1 | 'PaginationMeta' never used | Minor |

---

## Coverage Metrics

Test coverage was not fully extracted, but based on passing tests:

- **Shared Components:** Well covered (confirm-dialog, pagination-controls, role-guard, score-badge all passing)
- **New Checklist Builder Code:** No dedicated test files found
  - `src/stores/checklist-builder.store.ts` — **0% coverage** ❌
  - `src/features/criteria/hooks/use-criteria.ts` — **0% coverage** ❌
  - `src/features/audit/hooks/` (audit plans) — **0% coverage** ❌

**Coverage Gap:** Implementation phases 1-5 have no test coverage. Tests were not written during the feature development.

---

## Build Status

**npm run build:** Not executed (focus on test execution)

The two lint errors will prevent successful build/deployment and **must be fixed** before merging.

---

## Critical Issues Found

### 🔴 **BLOCKING ISSUES**

1. **React Hook Rules Violations** (2 errors)
   - Conditional hook call in checklist page
   - Memoization dependency mismatch in audit plans page
   - **Impact:** Build will fail, ESLint/Compiler will reject
   - **Priority:** P0 — Fix immediately

2. **MSW Test Setup Configuration**
   - API client and auth hook tests failing due to 401 responses
   - MSW server starts but handlers not registering per-test
   - **Impact:** 7 tests failing, auth flow untested
   - **Priority:** P1 — Affects test reliability

3. **No Tests for New Features**
   - Checklist builder store (Zustand+Immer)
   - Criteria multi-select dialog
   - Audit plan detail route
   - Content formatter
   - **Impact:** Feature untested, critical business logic uncovered
   - **Priority:** P1 — Coverage below acceptable threshold

---

## Recommendations

### Immediate Actions (P0)

1. **Fix React Hook Errors**
   - `src/app/(dashboard)/qam/checklists/[id]/page.tsx:174` — Move useMemo before conditional
   - `src/app/(dashboard)/qam/audit-plans/page.tsx:50` — Add `router` to deps or refactor logic
   - Verify with `npm run lint -- src/` before commit

2. **Fix MSW Test Setup**
   - Investigate why `server.use()` handlers aren't being applied in test context
   - May need to review `src/test/setup.ts` and `src/test/global-setup.ts`
   - Ensure handlers are reset between tests properly
   - Add debugging: `console.log()` in handler registration to verify execution

### High Priority Actions (P1)

3. **Write Tests for Checklist Builder**
   - Create `src/stores/checklist-builder.store.ts` test file
     - Test state initialization
     - Test section CRUD (add, update, delete)
     - Test item CRUD operations
     - Test scoring calculation
   - Create `src/features/checklist/` integration tests
     - Test multi-select criteria dialog
     - Test section rendering
     - Test delete operations

4. **Write Tests for Criteria Hooks**
   - Create `src/features/criteria/hooks/use-criteria.test.ts`
   - Test criteria list querying
   - Test filtering/search

5. **Fix Lint Warnings**
   - Remove unused imports/variables
   - Fix dependency array warnings in useMemo/useCallback

### Medium Priority Actions (P2)

6. **Debug Failing Tests**
   - Run tests with verbose logging to identify MSW issue
   - Check if fetch is being intercepted correctly
   - Verify axios interceptors not conflicting with MSW

7. **Add E2E Tests**
   - Checklist builder flow: create → add items → delete → save
   - Audit plan creation and detail view
   - Ensure user flows work end-to-end

---

## Test Infrastructure Changes

Made the following changes to fix test infrastructure:

1. **tsconfig.json** — Added vitest types to resolve global test function definitions
2. **vitest.config.ts** — Confirmed globals enabled, added globalSetup for MSW
3. **src/test/setup.ts** — Configured per-test cleanup (cleanup + resetHandlers)
4. **src/test/global-setup.ts** — Created for MSW server lifecycle management

---

## Unresolved Questions

1. **Why do API client tests get 401 responses?**
   - Are MSW handlers being registered before test execution?
   - Is request interception chain correct?
   - Does axios interceptor conflict with MSW?

2. **Are the 5 passing test suites sufficient baseline?**
   - Component tests passing, but auth/api client tests failing
   - Should we focus on fixing MSW before adding new tests?

3. **How critical is the lack of checklist builder test coverage?**
   - Store state management has complex logic (Zustand+Immer)
   - Multi-select dialog has edge cases
   - Risk of production bugs if not tested

4. **Should E2E tests be run to validate feature?**
   - Tests reference user flows but no Playwright tests exist
   - Could validate via browser testing instead?

---

## Summary

**Test execution is now working (81 tests runnable)** but reveals two categories of problems:

1. **Code Quality Issues** — 2 critical linting errors blocking build
2. **Test Coverage Gaps** — New feature has zero test coverage
3. **Test Reliability Issues** — MSW mocking not working correctly for API tests

**Recommend:**
- Fix lint errors immediately (5 min)
- Debug MSW setup (15-30 min)
- Write checklist builder tests (1-2 hours)
- Run full test suite before merge

**Next Step:** Address the P0 lint errors, then investigate MSW test setup, then add test coverage for new features.
