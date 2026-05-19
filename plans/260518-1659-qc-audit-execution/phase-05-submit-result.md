# Phase 5 — Submit + Result Display

**Effort:** 30m | **Depends on:** Phase 3, Phase 4

## Overview

Sticky submit bar, confirm dialog, gọi `submitAudit`, hiển thị kết quả điểm sau submit.
Xử lý 409 stale error và chuyển read-only khi `completed`.

## Files tạo mới

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/submit-bar.tsx`

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmitConfirmDialog } from "./submit-confirm-dialog";
import type { AuditSession } from "@/shared/types";
import type { ViolationsState } from "../_lib/violations-reducer";

interface Props {
  assignmentId: string;
  violations: ViolationsState;
  session: AuditSession;
  onStaleError: () => void;
}

export function SubmitBar({ assignmentId, violations, session, onStaleError }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const violationCount = Object.values(violations).filter((v) => v.numErrors > 0).length;
  const totalCriteria = session.checklist.sections.reduce(
    (sum, s) => sum + (s.items?.length ?? 0),
    0
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t px-4 py-3 flex items-center justify-between gap-4 md:left-64">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{violationCount}</span> lỗi /{" "}
          {totalCriteria} tiêu chí
        </div>
        <Button onClick={() => setConfirmOpen(true)} className="min-w-[120px]">
          Nộp bài
        </Button>
      </div>

      <SubmitConfirmDialog
        open={confirmOpen}
        assignmentId={assignmentId}
        violations={violations}
        onClose={() => setConfirmOpen(false)}
        onStaleError={() => {
          setConfirmOpen(false);
          onStaleError();
        }}
      />
    </>
  );
}
```

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/submit-confirm-dialog.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitAudit } from "@/features/audit";
import { AuditResultPanel } from "./audit-result-panel";
import { toast } from "sonner";
import type { ViolationsState } from "../_lib/violations-reducer";
import type { SubmitAuditResponse } from "@/shared/types";

interface Props {
  open: boolean;
  assignmentId: string;
  violations: ViolationsState;
  onClose: () => void;
  onStaleError: () => void;
}

export function SubmitConfirmDialog({
  open,
  assignmentId,
  violations,
  onClose,
  onStaleError,
}: Props) {
  const { mutateAsync: submitAudit, isPending } = useSubmitAudit();
  const [result, setResult] = useState<SubmitAuditResponse | null>(null);

  async function handleSubmit() {
    const violationList = Object.entries(violations)
      .filter(([, v]) => v.numErrors > 0)
      .map(([criteriaId, v]) => ({
        criteriaId,
        numErrors: v.numErrors,
        note: v.note ?? undefined,
        imageIds: v.imageIds,
      }));

    try {
      const res = await submitAudit({ assignmentId, violations: violationList });
      setResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("changed while the request was in progress")) {
        // 409 stale
        toast.warning("Dữ liệu thay đổi, đang tải lại...");
        onStaleError(); // triggers refetch trong page
      } else if (msg.includes("Completed assignment")) {
        toast.error("Bài đã được nộp trước đó");
        onClose();
      } else if (msg.includes("outside the allowed audit window")) {
        toast.error("Đã hết cửa sổ thời gian audit");
        onClose();
      } else {
        toast.error("Nộp bài thất bại — thử lại");
      }
    }
  }

  // Sau khi có result → hiển thị kết quả, không cho đóng bằng X
  if (result) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle>Kết quả bài kiểm tra</DialogTitle>
          </DialogHeader>
          <AuditResultPanel result={result} />
          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Về danh sách việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận nộp bài?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Sau khi nộp, bạn không thể chỉnh sửa lại bài kiểm tra này.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Đang nộp..." : "Xác nhận nộp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/audit-result-panel.tsx`

```tsx
import { formatScore, formatGrade } from "@/lib/format";
import { ScoreBadge } from "@/shared/components";
import type { SubmitAuditResponse } from "@/shared/types";

interface Props {
  result: SubmitAuditResponse;
}

export function AuditResultPanel({ result }: Props) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="text-center py-4">
        <div className="text-4xl font-bold mb-1">
          {formatScore(result.finalScore)}
        </div>
        <ScoreBadge score={result.finalScore} grade={result.grade} />
        {result.isRiskTriggered && (
          <div className="mt-2 text-sm font-semibold text-warning">
            ⚠ RISK — Toàn bài về 0
          </div>
        )}
      </div>

      {/* Repeat info — chỉ hiện nếu có CCP triggered */}
      {result.repeatInfo.some((r) => r.isCriticalTriggered) && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tiêu chí kích hoạt CCP
          </p>
          {result.repeatInfo
            .filter((r) => r.isCriticalTriggered)
            .map((r) => (
              <div key={r.criteriaId} className="text-sm text-destructive">
                Lần {r.repeatCount} · {r.numErrors} lỗi
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
```

## Lưu ý triển khai

- `Dialog hideClose` — shadcn không có prop này mặc định. Dùng `[&>button]:hidden` className hoặc override bằng CSS để ẩn nút X khi đang hiện result.
- `formatScore` trong `format.ts` trả về `"85%"` — verify signature trước khi dùng.
- `ScoreBadge` — kiểm tra props hiện tại (`score`, `grade`) trong `score-badge.tsx`.
- Bottom bar `md:left-64` — adjust nếu sidebar width khác 64 (256px). Dùng CSS variable sidebar width nếu có.

## Read-only mode sau submit

Khi `useSubmitAudit` thành công, nó invalidate `["audit-session", assignmentId]`.
Page sẽ refetch session → `assignment.status === "completed"` → `isReadOnly = true` → `SubmitBar` biến mất, mọi input disabled.

Không cần manage read-only state manually — reactive từ session.

## Verification

```bash
npm run typecheck
```

Smoke test:
1. Điền lỗi → bấm "Nộp bài" → confirm dialog xuất hiện
2. Confirm → result panel hiển thị điểm và grade
3. Bấm "Về danh sách" → dialog đóng, submit bar biến mất, page read-only
4. Simulate 409: interceptor network tab → verify toast "Dữ liệu thay đổi, đang tải lại..."
