# Phase 2 — My Assignments Page

**Effort:** 20m | **Depends on:** Phase 1  
**Status:** ✅ COMPLETED

## Overview

Thay placeholder bằng DataTable thực cho `qc/my-assignments/page.tsx`.
Hook `useMyAssignments()` đã có trong `use-audit-plans.ts`.

## File sửa đổi

### `src/app/(dashboard)/qc/my-assignments/page.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useMyAssignments } from "@/features/audit";
import { DataTable, PageHeader, StatusBadge, EmptyState } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { MyAssignment } from "@/shared/types";
import type { Column } from "@/shared/components/data-table";

const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ thực hiện",
  in_progress: "Đang thực hiện",
  completed: "Đã hoàn thành",
};

const columns: Column<MyAssignment>[] = [
  {
    key: "store",
    header: "Cửa hàng",
    render: (row) => (
      <div>
        <div className="font-medium">{row.store.name}</div>
        <div className="text-sm text-muted-foreground">{row.store.code}</div>
      </div>
    ),
  },
  {
    key: "plan",
    header: "Kế hoạch",
    render: (row) => (
      <div>
        <div className="font-medium">{row.plan.name}</div>
        <div className="text-sm text-muted-foreground">
          {formatDate(row.plan.startDate)} – {formatDate(row.plan.endDate)}
        </div>
      </div>
    ),
  },
  {
    key: "checklist",
    header: "Biểu mẫu",
    render: (row) => `${row.checklist.name} v${row.checklist.version}`,
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => (
      <div className="flex flex-col gap-1">
        <StatusBadge status={row.status} label={ASSIGNMENT_STATUS_LABEL[row.status]} />
        {!row.plan.isAuditWindowOpen && row.status !== "completed" && (
          <Badge variant="outline" className="text-xs text-warning border-warning">
            Ngoài cửa sổ audit
          </Badge>
        )}
      </div>
    ),
  },
];

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: assignments = [], isLoading } = useMyAssignments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Việc của tôi"
        description="Danh sách bài kiểm tra được giao"
      />
      <DataTable
        columns={columns}
        data={assignments}
        loading={isLoading}
        onRowClick={(row) => router.push(`/qc/audits/${row.id}`)}
        emptyState={
          <EmptyState
            title="Chưa có bài kiểm tra"
            description="Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây."
          />
        }
      />
    </div>
  );
}
```

## Lưu ý

- `useMyAssignments()` xuất từ `src/features/audit/index.ts` — kiểm tra export trước khi dùng
- `DataTable` nhận `onRowClick` — đây là prop có sẵn (xem `data-table.tsx`)
- `StatusBadge` nhận `status` + `label` — nếu không có prop `label`, dùng wrapper `<span>` riêng
- Nếu `DataTable` không có prop `emptyState`, dùng `data.length === 0` check thủ công

## Verification

```bash
npm run typecheck
```

Smoke test: Đăng nhập role QC → vào `/qc/my-assignments` → thấy table (hoặc empty state nếu chưa có data).
