"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApplyAuditCorrection } from "@/features/audit";
import type { AuditResultDetail, AuditViolationWrite } from "@/shared/types";

interface ViolationEdit {
  criteriaId: string;
  code: string;
  content: string;
  numErrors: number;
  note: string;
}

interface CorrectionEditFormProps {
  audit: AuditResultDetail;
}

export function CorrectionEditForm({ audit }: CorrectionEditFormProps) {
  const [editNote, setEditNote] = useState(audit.editNote ?? "");
  const [edits, setEdits] = useState<ViolationEdit[]>(
    audit.violations.map((v) => ({
      criteriaId: v.criteria.id,
      code: v.criteria.code,
      content: v.criteria.content,
      numErrors: v.numErrors,
      note: v.note ?? "",
    }))
  );

  const applyCorrection = useApplyAuditCorrection();

  function updateErrors(criteriaId: string, delta: number) {
    setEdits((prev) =>
      prev.map((e) =>
        e.criteriaId === criteriaId
          ? { ...e, numErrors: Math.max(0, e.numErrors + delta) }
          : e
      )
    );
  }

  function updateNote(criteriaId: string, note: string) {
    setEdits((prev) =>
      prev.map((e) => (e.criteriaId === criteriaId ? { ...e, note } : e))
    );
  }

  async function handleSubmit() {
    if (!editNote.trim()) {
      toast.error("Vui lòng nhập ghi chú sửa chữa");
      return;
    }
    const violations: AuditViolationWrite[] = edits.map((e) => ({
      criteriaId: e.criteriaId,
      numErrors: e.numErrors,
      note: e.note || null,
    }));
    try {
      await applyCorrection.mutateAsync({
        auditId: audit.id,
        editNote,
        violations,
      });
      toast.success("Đã áp dụng sửa chữa và tính lại điểm");
    } catch {
      toast.error("Sửa chữa thất bại");
    }
  }

  return (
    <div className="space-y-4 border-t border-border/40 pt-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Sửa chữa bài kiểm tra (QA Manager)
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Ghi chú sửa chữa *</label>
        <textarea
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          rows={2}
          placeholder="Mô tả lý do sửa chữa..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Chỉnh sửa số lỗi:</p>
        {edits.map((e) => (
          <div key={e.criteriaId} className="rounded-md border border-border/50 bg-muted/30 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs text-muted-foreground">{e.code}</span>
                <p className="text-sm text-foreground leading-snug">{e.content}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => updateErrors(e.criteriaId, -1)}
                  className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{e.numErrors}</span>
                <button
                  type="button"
                  onClick={() => updateErrors(e.criteriaId, 1)}
                  className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="text"
              value={e.note}
              onChange={(ev) => updateNote(e.criteriaId, ev.target.value)}
              placeholder="Ghi chú (tùy chọn)"
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ))}
      </div>

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={applyCorrection.isPending}
      >
        {applyCorrection.isPending ? "Đang áp dụng…" : "Áp dụng sửa chữa"}
      </Button>
    </div>
  );
}
