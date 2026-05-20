"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitAudit } from "@/features/audit";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";
import { AuditResultPanel } from "./audit-result-panel";
import type { ViolationsState } from "../_lib/violations-reducer";
import type { AuditSession, SubmitAuditResponse } from "@/shared/types";

interface SubmitConfirmDialogProps {
  open: boolean;
  assignmentId: string;
  violations: ViolationsState;
  session: AuditSession;
  onClose: () => void;
  onStaleError: () => void;
  onSubmitSuccess: () => void;
}

export function SubmitConfirmDialog({
  open,
  assignmentId,
  violations,
  session,
  onClose,
  onStaleError,
  onSubmitSuccess,
}: SubmitConfirmDialogProps) {
  const { mutateAsync: submitAudit, isPending } = useSubmitAudit();
  const [result, setResult] = useState<SubmitAuditResponse | null>(null);

  async function handleSubmit() {
    // Guard against stale criteria — include both checklist sections AND global risk criteria
    const validCriteriaIds = new Set([
      ...session.checklist.sections.flatMap((s) => s.items?.map((i) => i.criteriaId) ?? []),
      ...(session.riskCriteria ?? []).map((c) => c.id),
    ]);
    const violationList = Object.entries(violations)
      .filter(([criteriaId, v]) => v.numErrors > 0 && validCriteriaIds.has(criteriaId))
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
      if (err instanceof ApiClientError) {
        if (err.statusCode === 409) {
          toast.warning("Dữ liệu thay đổi, đang tải lại...");
          onStaleError();
          return;
        }
        if (err.statusCode === 400 || err.statusCode === 403) {
          // Already completed, outside window, wrong criteria, etc.
          toast.error(err.message || "Không thể nộp bài — thử lại");
          onClose();
          return;
        }
      }
      toast.error("Nộp bài thất bại — thử lại");
    }
  }

  // After submit success: show result, block dismissal until user navigates
  if (result) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Kết quả bài kiểm tra</DialogTitle>
          </DialogHeader>
          <AuditResultPanel result={result} />
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setResult(null);
                onClose();
                onSubmitSuccess(); // navigate to my-assignments
              }}
            >
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
          <DialogDescription>
            Sau khi nộp, bạn không thể chỉnh sửa lại bài kiểm tra này.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
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
