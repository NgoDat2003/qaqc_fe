# Phase 4: Analytics + Dashboards

**Priority:** High  
**Effort:** ~3h  
**Status:** ✅ done  
**Requires:** Phase 1 done

## Overview

Tất cả 6 dashboard hiện là `<div>X Dashboard — TODO</div>`. Analytics endpoint đã có ở BE. Implement API layer + hook + từng role dashboard.

## BE Endpoint

```
GET /api/analytics/overview
```

**RBAC behavior:**
- `qc_auditor` → 403 (blocked by BE)
- `store_manager`, `am` → aggregate theo store scope (BE filter tự động)
- `qa_manager`, `company_admin`, `executive_viewer` → toàn hệ thống

**Response shape** (dự đoán từ handoff — verify khi test):
```typescript
interface AnalyticsOverview {
  totalAudits: number;
  avgScore: number;
  passRate: number;       // 0–1
  failCount: number;
  recentAudits?: Array<{
    id: string;
    store: Pick<Store, "id" | "name" | "code">;
    finalScore: number;
    grade: ScoreGrade;
    submittedAt: string;
  }>;
}
```

## Implementation Steps

### Step 4.1 — Analytics API + Hook

**New file:** `src/features/dashboard/api/analytics.api.ts`
```typescript
import { apiClient } from "@/lib/api-client";
import type { AnalyticsOverview } from "@/shared/types";

export const analyticsApi = {
  getOverview: () => apiClient.get<AnalyticsOverview>("/analytics/overview"),
};
```

**New file:** `src/features/dashboard/hooks/use-analytics.ts`
```typescript
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics.api";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: analyticsApi.getOverview,
    retry: false,  // 403 không retry
  });
}
```

**403 handling pattern** (dùng trong dashboard components):
```typescript
const { data, isLoading, error } = useAnalyticsOverview();
const is403 = error instanceof ApiClientError && error.statusCode === 403;
if (is403) return <NoAccessPlaceholder />;
```

### Step 4.2 — Shared MetricCard usage

`src/shared/components/metric-card.tsx` đã có. Dùng lại cho tất cả dashboards.

Verify props: `title`, `value`, `subtitle?`, `trend?`, `icon?`.

### Step 4.3 — QC Dashboard

File: `src/features/dashboard/qc-dashboard.tsx`

QC **không** có analytics (BE trả 403). Show my recent audits thay thế.

```typescript
export function QCDashboard() {
  const { data: assignments } = useMyAssignments();
  
  return (
    <div className="space-y-6">
      <h2>My Assignments</h2>
      {/* Pending assignments */}
      <div className="space-y-3">
        {assignments?.filter(a => a.status === "pending").map(a => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </div>
      {/* Recent completed */}
    </div>
  );
}
```

No MetricCard for QC — no analytics access.

### Step 4.4 — SM Dashboard

File: `src/features/dashboard/sm-dashboard.tsx`

SM có analytics scope-filtered theo store. Show:
- Last audit score (từ `recentAudits[0]`)
- Pending AP count (từ action plans list)
- Trend nếu có data

```typescript
export function SMDashboard() {
  const { data, error } = useAnalyticsOverview();
  const is403 = error instanceof ApiClientError && error.statusCode === 403;
  
  if (is403) return <QCDashboard />;  // fallback nếu SM cũng bị block (defensive)
  
  const lastAudit = data?.recentAudits?.[0];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="Điểm Gần Nhất" value={lastAudit?.finalScore ?? "—"} />
        <MetricCard title="Pass Rate" value={data ? `${Math.round(data.passRate * 100)}%` : "—"} />
      </div>
      {/* Recent audits list */}
    </div>
  );
}
```

### Step 4.5 — AM Dashboard

File: `src/features/dashboard/am-dashboard.tsx`

AM scope-filtered như SM. Show store ranking nếu có multi-store data, otherwise similar to SM.

```typescript
export function AMDashboard() {
  const { data } = useAnalyticsOverview();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title="Tổng Audit" value={data?.totalAudits ?? "—"} />
        <MetricCard title="Điểm TB" value={data?.avgScore?.toFixed(1) ?? "—"} />
        <MetricCard title="Pass Rate" value={data ? `${Math.round(data.passRate * 100)}%` : "—"} />
        <MetricCard title="Cần Xử Lý" value={data?.failCount ?? "—"} />
      </div>
      {/* Recent audits */}
    </div>
  );
}
```

### Step 4.6 — QAM / CA / EV Dashboard

Files: `qam-dashboard.tsx`, `ca-dashboard.tsx`, `ev-dashboard.tsx`

Cả 3 đều có full analytics access. Dùng chung layout, chỉ khác permission trên mutate actions.

```typescript
// Shared layout — reuse across QAM/CA/EV
function FullSystemDashboard({ showManageActions }: { showManageActions?: boolean }) {
  const { data, isLoading } = useAnalyticsOverview();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title="Tổng Audit" value={data?.totalAudits ?? "—"} isLoading={isLoading} />
        <MetricCard title="Điểm Trung Bình" value={data?.avgScore?.toFixed(1) ?? "—"} isLoading={isLoading} />
        <MetricCard title="Pass Rate" value={data ? `${Math.round(data.passRate * 100)}%` : "—"} isLoading={isLoading} />
        <MetricCard title="Cần Cải Thiện" value={data?.failCount ?? "—"} isLoading={isLoading} />
      </div>
      {/* Recent audits table */}
      {data?.recentAudits && <RecentAuditsTable audits={data.recentAudits} />}
    </div>
  );
}

export function QAMDashboard() { return <FullSystemDashboard showManageActions />; }
export function CADashboard()  { return <FullSystemDashboard />; }
export function EVDashboard()  { return <FullSystemDashboard />; }
```

### Step 4.7 — Dashboard page wire-up

File: `src/app/(dashboard)/dashboard/page.tsx`

Verify current content — likely renders role-split dashboards. Confirm it uses `activeRole` from auth store:

```typescript
// Pattern already in codebase (check existing dashboard/page.tsx)
const { session } = useAuthStore();
switch (session?.activeRole) {
  case "qa_manager":      return <QAMDashboard />;
  case "qc_auditor":      return <QCDashboard />;
  case "store_manager":   return <SMDashboard />;
  case "am":              return <AMDashboard />;
  case "company_admin":   return <CADashboard />;
  case "executive_viewer": return <EVDashboard />;
}
```

## Files to Create

- `src/features/dashboard/api/analytics.api.ts`
- `src/features/dashboard/hooks/use-analytics.ts`

## Files to Modify

- `src/features/dashboard/qc-dashboard.tsx`
- `src/features/dashboard/sm-dashboard.tsx`
- `src/features/dashboard/am-dashboard.tsx`
- `src/features/dashboard/qam-dashboard.tsx`
- `src/features/dashboard/ca-dashboard.tsx`
- `src/features/dashboard/ev-dashboard.tsx`
- `src/app/(dashboard)/dashboard/page.tsx` (verify role-switch)

## Success Criteria

- `GET /api/analytics/overview` được gọi đúng cho QAM/CA/EV/SM/AM
- QC dashboard không call analytics endpoint
- 403 response không crash app — graceful fallback
- MetricCards hiển thị data thật từ BE
- `npm run typecheck` passes

## Risk

- `AnalyticsOverview` response shape chưa được xác nhận chính xác — BE handoff chỉ mô tả chung chung. Cần test với BE thật để biết exact field names
- `MetricCard` props cần verify (có thể cần `isLoading` prop để show skeleton)
- `useMyAssignments` hook cho QC dashboard: kiểm tra `use-audit-execute.ts` đã có hay chưa

## Unresolved Questions

1. Response schema của `GET /api/analytics/overview` chính xác là gì? Handoff không cung cấp đầy đủ.
2. `MetricCard` component có hỗ trợ loading skeleton không?
3. QC dashboard nên hiển thị gì ngoài my-assignments? Score trend cá nhân?
