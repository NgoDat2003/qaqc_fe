# E2E Test Results — QAM Frontend

**Date:** 2026-05-18  
**Test Suite:** Playwright E2E (Chromium)  
**Environment:** Development (FE: http://localhost:3001, BE: http://localhost:3000)

---

## Test Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 39 |
| **Passed** | 37 |
| **Failed** | 2 |
| **Success Rate** | 94.9% |
| **Execution Time** | 2 min 5 sec |

---

## Results by Feature

### Admin Module — PASS ✓
- **Auth flow**: 4/4 tests pass (login, credentials validation, redirects)
- **Organization (Stores + Brands)**: 8/8 tests pass (table rendering, search, drawer interactions)
- **Users Management**: 5/5 tests pass (page load, filters, UserDrawer tabs)

**Status:** Stable. All admin features working correctly.

### QAM Audit Plans — PARTIAL FAIL ✗

#### Passing Tests (3/5)
- ✓ audit plans page loads
- ✓ status filter tabs visible
- ✓ Tạo kế hoạch navigates to create form
- ✓ Hủy navigates away from create form

#### Failing Tests (2/5)

**Test 1: "assignment row has store, QC, date fields"**
- **Status:** FAIL (2 retries exhausted)
- **Error:** `TimeoutError: locator.waitFor: Timeout 10000ms exceeded`
- **Details:** Test expects "Chọn cửa hàng..." placeholder to be visible on page load
- **Root Cause:** Form UI design shows empty state message when no rows exist; rows only render after user adds stores via dialog
- **Line:** `e2e/qam-audit-plans.spec.ts:45`

**Test 2: "+ Thêm cửa hàng adds a new assignment row"**
- **Status:** FAIL (2 retries exhausted)
- **Error:** `TimeoutError: locator.waitFor: Timeout 10000ms exceeded`
- **Details:** Same issue — waiting for row placeholders on empty form
- **Root Cause:** Depends on Test 1 passing; cannot execute assignment count logic without initial row
- **Line:** `e2e/qam-audit-plans.spec.ts:52`

### QAM Checklists — PASS ✓
- 5/5 tests pass (page load, filters, metrics, dialog, builder navigation)

### QAM Criteria — PASS ✓
- 6/6 tests pass (groups page, drawer, criteria library, filters)

---

## Failed Test Details

### Issue Analysis

**Problem:** The E2E tests assume assignment rows are rendered on page load with placeholder text visible. However, the implementation uses a conditional render pattern:

```typescript
// Current behavior (src/app/(dashboard)/qam/audit-plans/new/page.tsx lines 212-235)
{rows.length === 0 ? (
  <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
    <p className="font-medium text-sm">Chưa có cửa hàng nào</p>
    <p className="text-xs mt-1">Nhấn + Thêm cửa hàng để chọn hàng loạt</p>
  </div>
) : (
  // Rows grid rendering with placeholders
  <div className="space-y-3">
    <div className="grid grid-cols-[1fr_1fr_36px] gap-3">...</div>
    {rows.map((row) => (
      <div key={row.key} className="grid grid-cols-[1fr_1fr_36px]">
        <ComboboxInput ... placeholder="Chọn cửa hàng..." />
        <ComboboxInput ... placeholder="Chọn QC..." />
        ...
      </div>
    ))}
  </div>
)}
```

**Expected behavior:** Tests need to either:
1. Add an initial assignment row on mount (BAD — clutters UX)
2. Update tests to add a row before asserting on placeholders (GOOD — correct test logic)
3. Mock initial data in test setup (BAD — diverges from real user flow)

---

## Test Infrastructure

**Typecheck:** ✓ PASS (0 errors)  
**Playwright Config:** ✓ Valid (4 workers, retries=2)  
**Dev Server:** Assumed running (tests require http://localhost:3001)  
**MSW Handlers:** ✓ Configured for QAM auth + data mocking

---

## Recommendations

### CRITICAL — Fix Failing Tests

The 2 failing tests in `qam-audit-plans.spec.ts` use incorrect assumptions about form initialization. **They should be rewritten to match real user workflow:**

**Fix approach:**
1. Line 44-49: Add initial row before asserting placeholders exist
2. Line 51-58: Same fix — verify row addition logic after initial row exists

**Example fix pattern:**
```typescript
test("assignment row has store, QC, date fields", async ({ page }) => {
  // Add initial row to populate assignment section
  await page.getByText(/Thêm cửa hàng/i).first().click();
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  
  // Select a store from dialog to create row
  const storeOptions = await page.locator("input[type='checkbox']").all();
  if (storeOptions.length > 0) {
    await storeOptions[0].click();
    await page.getByRole("button", { name: /Thêm.*cửa hàng/i }).click();
  }
  
  // Now verify placeholders exist
  await page.getByText("Chọn cửa hàng...").waitFor({ timeout: ELEMENT_TIMEOUT });
  await expect(page.getByText("Chọn cửa hàng...").first()).toBeVisible();
  await expect(page.getByText("Chọn QC...").first()).toBeVisible();
  await expect(page.locator("input[type='date']").first()).toBeVisible();
});
```

### Coverage Gaps Identified

- **Audit Plan draft/publish flow** — Not tested in E2E suite. Verify status transitions (draft → open → closed) through detail page tests.
- **Back button on detail pages** — Only tested in cancel flow; should verify on detail page loads.
- **Multi-select store dialog** — Dialog UX is tested indirectly but lacks dedicated dialog interaction specs (checkbox selection, select-all toggle, search filter).
- **Column filters on tables** — Filter tabs tested but no column-level filtering tests (only tab-based status filters).

### Performance Notes

- Slowest tests: QAM audit plans tests (13-19s) — likely due to data loading on fresh page
- Fastest tests: Form validation tests (3-6s)
- Overall E2E suite completes in ~2 min, which is acceptable

---

## Infrastructure Status

### Environment Checks
- **FE Dev Server:** Required at http://localhost:3001 (assumed running)
- **BE API:** Required at http://localhost:3000 (assumed running)
- **Database:** SQLite (dev) — requires seeding for test data
- **Authentication:** JWT httpOnly cookie (`qo_token`) — handled by auth helpers

### Test Helpers
- `loginAsQAM()`: ✓ Working (7+ tests pass post-login)
- `ELEMENT_TIMEOUT` (10s): Appropriate for development environment
- `NAV_TIMEOUT` (15s): Adequate for page transitions

---

## Next Steps (Prioritized)

1. **[BLOCKING]** Rewrite failing audit plan tests to match actual form behavior
2. **[HIGH]** Add E2E tests for audit plan detail page (draft/publish flow)
3. **[HIGH]** Add dedicated tests for multi-select store dialog interactions
4. **[MEDIUM]** Expand column filter tests beyond status tabs
5. **[MEDIUM]** Add back button verification tests on all detail pages
6. **[LOW]** Optimize test execution time (e.g., parallel fixtures, data seeding)

---

## Unresolved Questions

- Should initial audit plan rows be pre-populated on mount? (Affects test design vs. UX)
- Are there additional detail page features (approval flow, status transitions) that need E2E coverage?
- Should multi-select store dialog have additional validation tests (max stores, duplicate prevention)?
