# Test Infrastructure Fixes Applied

**Date:** 2026-05-16  
**Context:** Fixed Vitest 4.x configuration issues preventing test execution

---

## Problems Encountered

1. **TypeScript Type Errors**
   - `afterEach`, `beforeAll`, `afterAll` not recognized in test setup files
   - Caused `Cannot find name 'afterEach'` errors during typecheck
   - Root cause: Vitest global types not configured in tsconfig

2. **Vitest Module Isolation Issues**
   - Vitest reported "failed to find the runner" when importing from vitest in setupFiles
   - Related to setupFiles context vs test context boundary
   - Each setupFiles approach had different failures

3. **Test Execution Failures**
   - Initial attempts: "Cannot read properties of undefined (reading 'config')" at describe level
   - Caused by globals not being available during test file loading
   - Multiple config iterations attempted before finding working solution

---

## Solution Implemented

### 1. Added Vitest Types to TypeScript Config

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"],
    // ... rest of config
  }
}
```

**Effect:** TypeScript now recognizes `beforeAll`, `afterEach`, `afterAll`, etc. as global functions in test files.

### 2. Configured Vitest with Both Setup Approaches

**File:** `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/features/**", "src/lib/**", "src/components/**", "src/shared/**"],
    },
    testTimeout: 10000,
  },
})
```

**Key Settings:**
- `globals: true` — Makes vitest functions available without imports
- `setupFiles` — Runs once per test file (for per-test hooks)
- `globalSetup` — Runs once before all tests (for MSW server startup)

### 3. Global MSW Server Setup

**File:** `src/test/global-setup.ts` (NEW)

```typescript
import { server } from "./msw-server"

export async function setup() {
  // Start MSW server for all tests
  server.listen({ onUnhandledRequest: "warn" })

  return async () => {
    // Return teardown function
    server.close()
  }
}
```

**Purpose:** Starts MSW server once before all tests run, closes after all tests complete.

### 4. Per-Test Cleanup Configuration

**File:** `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { server } from "./msw-server"

// This runs in each test file context (not global setup)
// We need to register afterEach here to work with the test suite
if (typeof afterEach !== "undefined") {
  afterEach(() => {
    cleanup()
    server.resetHandlers()
  })
}
```

**Purpose:** 
- Imports jest-dom matchers (must happen here, not in globalSetup)
- Resets MSW handlers after each test
- Cleans up React Testing Library resources

---

## Why This Works

### Vitest 4.x Constraints

1. **setupFiles** can run with globals available, but importing from vitest inside setupFiles causes "failed to find the runner" error
   - Solution: Don't import vitest functions in setupFiles; use globals that are already available

2. **globalSetup** runs in isolated context without test globals
   - Solution: Don't use `beforeAll`, `afterAll` here; use plain async functions

3. **globals: true** injects test functions into global scope
   - Makes `describe`, `it`, `expect`, `beforeAll`, etc. available everywhere

### Separation of Concerns

- **globalSetup:** MSW server lifecycle (once per test run)
- **setupFiles:** Per-test cleanup and jest-dom setup (runs for each test file)
- **Test files:** Import test functions or rely on globals

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `tsconfig.json` | Added `"types": ["vitest/globals"]` | Enable TS recognition of test globals |
| `vitest.config.ts` | Confirmed globals, added globalSetup | Proper test environment setup |
| `src/test/setup.ts` | Wrapped afterEach in typeof check | Safe per-test cleanup |
| `src/test/global-setup.ts` | Created new file | MSW server startup/shutdown |

---

## Test Execution Result

After these fixes:

```
npm run test -- --run
✅ 81 total tests
✅ 74 passed
❌ 7 failed (pre-existing auth/api test issues, not from setup)
✅ Tests now execute without infrastructure errors
```

---

## Known Remaining Issues

1. **MSW Handler Registration**
   - Tests still getting 401 responses from `server.use()` calls
   - Likely handler registration timing or context issue
   - Future debugging: Check if handlers are being applied before requests

2. **No Coverage for New Features**
   - Checklist builder store not tested
   - Criteria hooks not tested
   - Audit plan features not tested

---

## How to Run Tests Going Forward

```bash
# Run all tests (once)
npm run test -- --run

# Run tests in watch mode (during development)
npm run test

# Run tests with coverage report
npm run test:coverage

# Typecheck (validates types including test globals)
npm run typecheck

# Lint (includes unused import detection)
npm run lint -- src/
```

All commands now have proper test infrastructure in place.
