# Phase 4 — Audit Plan Edit UI

**Effort:** 40 phút | **Status:** pending

## Overview (updated per BE docs 2026-05-18)

Build UI cho workflow `draft → open → closed` của audit plan:

1. **Type update**: `AuditPlanFull.status: "draft" | "open" | "closed"`
2. **Create → redirect to draft**: Sau POST, redirect đến `/qam/audit-plans/:id` để user thấy draft
3. **Publish flow**: Nút "Giao việc" gọi `POST /api/audit-plans/:id/publish` (draft → open)
4. **Edit plan details**: Draft = full edit (name/formId/dates/assignments), Open = limited (name/dates)
5. **Đổi QC / Xóa assignment**: Condition = `status === "pending" && auditId === null`
6. **localStorage draft auto-save** ở trang `new`

**Status table từ BE:**
| Status | FE cho phép |
|--------|------------|
| `draft` | Sửa full, thêm/xóa assignments, publish |
| `open` | Sửa name/dates, đổi QC/xóa assignment pending (auditId=null) |
| `closed` | Chỉ xem |

**Editable assignment rule** (từ BE): `status === "pending" && auditId === null`

## Files

**Modify:**
- `src/features/audit/api/audit.api.ts`
- `src/features/audit/hooks/use-audit-plans.ts`
- `src/app/(dashboard)/qam/audit-plans/[id]/page.tsx`
- `src/app/(dashboard)/qam/audit-plans/new/page.tsx`

**Create:**
- `src/app/(dashboard)/qam/audit-plans/[id]/_components/edit-plan-dialog.tsx`
- `src/app/(dashboard)/qam/audit-plans/[id]/_components/change-auditor-dialog.tsx`

## Implementation steps

### 0. Type update (`shared/types/index.ts`)

```ts
// Trước:
status: "open" | "closed";
// Sau:
status: "draft" | "open" | "closed";
```

### 1. API additions (`audit.api.ts`)

```ts
// Draft: có thể đổi name/formId/dates/assignments
// Open: chỉ đổi được name/startDate/endDate
updateAuditPlan: (id: string, data: {
  name?: string; formId?: string;
  startDate?: string; endDate?: string;
  assignments?: Array<{ storeId: string; auditorId: string }>;
}) => apiClient.patch<AuditPlanFull>(`/audit-plans/${id}`, data),

// draft → open; giao việc cho QC
publishAuditPlan: (id: string) =>
  apiClient.post<AuditPlanFull>(`/audit-plans/${id}/publish`, {}),

updateAssignment: (planId: string, assignmentId: string, data: { auditorId: string }) =>
  apiClient.patch<AuditPlanFull>(`/audit-plans/${planId}/assignments/${assignmentId}`, data),

removeAssignment: (planId: string, assignmentId: string) =>
  apiClient.delete<AuditPlanFull>(`/audit-plans/${planId}/assignments/${assignmentId}`),
```

### 2. Hooks (`use-audit-plans.ts`)

```ts
export function usePublishAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditApi.publishAuditPlan(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["audit-plans"] });
      qc.invalidateQueries({ queryKey: ["audit-plans", id] });
    },
  });
}

export function useUpdateAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; startDate?: string; endDate?: string }) =>
      auditApi.updateAuditPlan(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-plans"] });
      qc.invalidateQueries({ queryKey: ["audit-plans", vars.id] });
    },
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, assignmentId, auditorId }: { planId: string; assignmentId: string; auditorId: string }) =>
      auditApi.updateAssignment(planId, assignmentId, { auditorId }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["audit-plans", vars.planId] }),
  });
}

export function useRemoveAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, assignmentId }: { planId: string; assignmentId: string }) =>
      auditApi.removeAssignment(planId, assignmentId),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["audit-plans", vars.planId] }),
  });
}
```

### 3. `_components/edit-plan-dialog.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateAuditPlan } from "@/features/audit/hooks/use-audit-plans";
import type { AuditPlanFull } from "@/shared/types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan: AuditPlanFull;
}

export function EditPlanDialog({ open, onOpenChange, plan }: Props) {
  const [name, setName] = useState(plan.name);
  const [startDate, setStartDate] = useState(plan.startDate?.split("T")[0] ?? "");
  const [endDate, setEndDate] = useState(plan.endDate?.split("T")[0] ?? "");
  const update = useUpdateAuditPlan();

  useEffect(() => {
    if (open) {
      setName(plan.name);
      setStartDate(plan.startDate?.split("T")[0] ?? "");
      setEndDate(plan.endDate?.split("T")[0] ?? "");
    }
  }, [open, plan]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Tên kế hoạch là bắt buộc"); return; }
    if (endDate < startDate) { toast.error("Ngày kết thúc phải sau ngày bắt đầu"); return; }
    try {
      await update.mutateAsync({
        id: plan.id,
        name: name.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      toast.success("Đã cập nhật kế hoạch");
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("404") || msg.includes("500")) {
        toast.error("Tính năng đang phát triển, vui lòng thử lại sau");
      } else {
        toast.error(msg || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Chỉnh sửa kế hoạch</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tên kế hoạch</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Bắt đầu</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Kết thúc</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending}>
            {update.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. `_components/change-auditor-dialog.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ComboboxInput } from "@/shared/components";
import { useUpdateAssignment } from "@/features/audit/hooks/use-audit-plans";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  planId: string;
  assignmentId: string;
  currentAuditorId: string;
}

export function ChangeAuditorDialog({
  open, onOpenChange, planId, assignmentId, currentAuditorId,
}: Props) {
  const [auditorId, setAuditorId] = useState(currentAuditorId);
  const { data: qcs = [] } = useUsersByRole("qc_auditor");
  const update = useUpdateAssignment();

  useEffect(() => { if (open) setAuditorId(currentAuditorId); }, [open, currentAuditorId]);

  const options = qcs.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName }));

  const handleSubmit = async () => {
    if (!auditorId) return;
    try {
      await update.mutateAsync({ planId, assignmentId, auditorId });
      toast.success("Đã đổi QC phụ trách");
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("404") || msg.includes("500")) {
        toast.error("Tính năng đang phát triển, vui lòng thử lại sau");
      } else {
        toast.error(msg || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Đổi QC phụ trách</DialogTitle></DialogHeader>
        <div className="space-y-2 py-2">
          <label className="text-xs font-semibold text-muted-foreground">Chọn QC mới</label>
          <ComboboxInput options={options} value={auditorId} onChange={setAuditorId} placeholder="Chọn QC..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending || !auditorId}>
            {update.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Cập nhật `[id]/page.tsx`

- State: `editPlanOpen`, `changeAuditor` ({ assignmentId, currentAuditorId } | null), `removingAssignmentId`
- Convert `columns` từ const → `useMemo` (cần handlers + plan.status)
- **PageHeader children** (theo status):
  - `draft`: nút "Chỉnh sửa" + nút "Giao việc (Publish)" — gọi `usePublishAuditPlan`
  - `open`: nút "Chỉnh sửa" (limited)
  - `closed`: không có nút
- **EditPlanDialog**: truyền `mode="draft"` hoặc `mode="open"` để hiển thị form phù hợp
- **RowActions** (assignment editable = `status === "pending" && !auditId`):
  - "Đổi QC" → set `changeAuditor`
  - "Xóa khỏi kế hoạch" → set `removingAssignmentId`
- **Filter cột "Trạng thái"**: 3 option
- BE error messages quan trọng cần map:
  - `"Open audit plan can only update name and audit window"` → toast cụ thể
  - `"Only pending assignment can be changed"` → toast cụ thể
  - `"Assignment already has audit data"` → toast cụ thể

### 6. localStorage draft auto-save (`new/page.tsx`)

Add constant + effects ở đầu component:

```tsx
const DRAFT_KEY = "audit-plan-draft";

interface Draft {
  planName: string; checklistId: string;
  startDate: string; endDate: string;
  rows: AssignmentRow[];
}
```

**Auto-save on change** (after state declarations):

```tsx
useEffect(() => {
  const hasContent = planName || checklistId || startDate || endDate || rows.length > 0;
  if (hasContent) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ planName, checklistId, startDate, endDate, rows }));
  }
}, [planName, checklistId, startDate, endDate, rows]);
```

**Restore on mount** — offer toast với undo:

```tsx
useEffect(() => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw) as Draft;
    if (!d.planName && !d.rows?.length) return;
    toast("Có bản nháp chưa lưu", {
      description: "Khôi phục bản nháp trước đó?",
      action: {
        label: "Khôi phục",
        onClick: () => {
          setPlanName(d.planName ?? "");
          setChecklistId(d.checklistId ?? "");
          setStartDate(d.startDate ?? "");
          setEndDate(d.endDate ?? "");
          setRows(d.rows ?? []);
        },
      },
      cancel: { label: "Bỏ qua", onClick: () => localStorage.removeItem(DRAFT_KEY) },
      duration: 8000,
    });
  } catch {
    localStorage.removeItem(DRAFT_KEY);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Clear sau submit thành công** — add ngay sau `toast.success` trong `handleSubmit`:

```tsx
localStorage.removeItem(DRAFT_KEY);
```

### 6a. Fix Create Flow (`new/page.tsx`)

Sau submit thành công, redirect đến detail page của draft vừa tạo:
```ts
// Trước:
router.push("/qam/audit-plans");
// Sau:
router.push(`/qam/audit-plans/${createdPlan.id}`);
```
`createPlan.mutateAsync` trả về `AuditPlanFull` — lấy `.id` từ đó.

## Success criteria

- `AuditPlanFull.status` nhận `"draft"` không TypeScript error
- Sau create → redirect đến detail page draft (không về list)
- Draft detail page: nút "Giao việc" + "Chỉnh sửa"; click "Giao việc" → confirm → plan thành `open`
- Open detail page: nút "Chỉnh sửa" (không có "Giao việc")
- Button "Chỉnh sửa kế hoạch" chỉ hiện khi `status !== "closed"`
- Dialog edit pre-fill đúng giá trị hiện tại
- `RowActions` chỉ render cho row `status === "pending"`
- BE 404/500 → toast "Tính năng đang phát triển, vui lòng thử lại sau", page không crash
- BE thành công → React Query invalidate, UI refresh
- Draft auto-save: refresh trang → toast hỏi khôi phục, click "Khôi phục" → form populated, submit thành công → localStorage cleared
- Cột "Trạng thái" có filter dropdown 3 option
- `npm run typecheck` pass

## Risks

- BE chưa có 3 endpoint mới — đã mitigate bằng fail-soft toast
- `apiClient.patch`/`delete` cần verify đã có method (đã dùng nhiều nơi → confirmed)
- localStorage quota: form nhỏ, không lo
- Multiple tabs ghi đè draft: chấp nhận — last-write-wins là behavior mong đợi

## Unresolved questions

- Chính xác message string khi BE trả 404/500: hiện check substring "404"/"500" trong message. Nếu `apiClient` throw error với shape khác, có thể cần điều chỉnh detection logic — cần verify thực tế khi test
- BE có validate được "không cho edit khi đã có assignment completed" không? FE hiện chỉ disable theo `plan.status` — chưa check progress
- Có cần confirm dialog khi edit plan? Hiện không có — dialog có Cancel button, đủ an toàn
