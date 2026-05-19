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
import { toast } from "sonner";
import { AuditResultPanel } from "./audit-result-panel";
import type { ViolationsState } from "../_lib/violations-reducer";
import type { SubmitAuditResponse } from "@/shared/types";

interface SubmitConfirmDialogProps {
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
}: SubmitConfirmDialogProps) {
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
        toast.warning("Dữ liệu thay đổi, đang tải lại...");
        onStaleError();
      } else if (msg.includes("Completed assignment") || msg.includes("cannot be changed")) {
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

  function handleClose() {
    setResult(null);
    onClose();
  }

  // After submit: show result panel, block dismissal until user clicks "Về danh sách"
  if (result) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Kết quả bài kiểm tra</DialogTitle>
          </DialogHeader>
          <AuditResultPanel result={result} />
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
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
