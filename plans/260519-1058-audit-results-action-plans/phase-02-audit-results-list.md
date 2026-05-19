# Phase 2 — Audit Results List

**Effort:** 20m | **Depends on:** Phase 1

## File sửa: `src/app/(dashboard)/qc/results/page.tsx`

Thay stub bằng DataTable thực với 4 metric cards và filter.

## Metric cards

- **Tổng bài kiểm tra** — `results.length`
- **Đạt** — count where `grade === "excellent" | "good" | "pass"`
- **Không đạt** — count where `grade === "fail"`
- **Báo động** — count where `grade === "alarm"` hoặc `isRiskTriggered`

## Columns

| Header | Cell | Note |
|--------|------|------|
| Cửa hàng | `store.name` / `store.code` mono | |
| Người kiểm tra | `auditor.fullName \|\| auditor.email` | hide mobile |
| Biểu mẫu | `checklist.name vX.X` | hide mobile |
| Điểm / Grade | `ScoreBadge score={finalScore}` | |
| Ngày nộp | `formatDate(submittedAt)` | hide mobile |
| Action Plan | `StatusBadge status={ap.status}` hoặc "—" | |
| Correction | Badge "Đang chờ QA" nếu `pendingCorrectionRequest != null` | |

## Code skeleton

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuditResults } from "@/features/audit";
import { DataTable, PageHeader, MetricCard, ScoreBadge, StatusBadge } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { BarChart2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const { data: results = [], isLoading } = useAuditResults();

  const stats = {
    total: results.length,
    passed: results.filter(r => ["excellent","good","pass"].includes(r.grade)).length,
    failed: results.filter(r => r.grade === "fail").length,
    alarm: results.filter(r => r.grade === "alarm" || r.isRiskTriggered).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Kết quả kiểm tra" subtitle="..." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 4 MetricCards */}
      </div>
      <DataTable
        columns={columns}
        data={results}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/qc/results/${row.id}`)}
      />
    </div>
  );
}
```

## Verification

- `npm run typecheck`
- Smoke: đăng nhập các role khác nhau → data khác nhau (BE scope)
