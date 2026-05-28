"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubmitActionPlan, useRejectActionPlan, useCloseActionPlan } from "@/features/audit";
import { useAuthStore } from "@/stores/auth.store";
import type { ActionPlanDetail, ActionPlanItem } from "@/shared/types";

interface ApSubmitBarProps {
  ap: ActionPlanDetail;
}

function validateItems(items: ActionPlanItem[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const item of items) {
    const v = item.violation;
    const needsImages = v.criteria.flag !== "none" || v.isCriticalTriggered || v.isRiskTriggered;
    if (!item.rootCause?.trim())    issues.push(`${v.criteria.code}: thiếu nguyên nhân`);
    if (!item.remediation?.trim())  issues.push(`${v.criteria.code}: thiếu hướng khắc phục`);
    if (!item.fixedAt)              issues.push(`${v.criteria.code}: thiếu ngày sửa`);
    if (!item.assigneeName?.trim()) issues.push(`${v.criteria.code}: thiếu người thực hiện`);
    if (needsImages && item.remediationImages.length === 0)
      issues.push(`${v.criteria.code}: cần ảnh khắc phục`);
  }
  return { valid: issues.length === 0, issues };
}

export function ApSubmitBar({ ap }: ApSubmitBarProps) {
  const role = useAuthStore((s) => s.activeRole);
  const isSM = role === "store_manager"; // qc_auditor excluded: no AP edit permission from BE
  const isQAM = role === "qa_manager";

  const [rejectNote, setRejectNote]       = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const submit = useSubmitActionPlan();
  const reject = useRejectActionPlan();
  const close  = useCloseActionPlan();

  const canSubmit = isSM  && (ap.status === "draft" || ap.status === "rejected");
  const canReview = isQAM && ap.status === "submitted";

  if (!canSubmit && !canReview) return null;

  const { valid, issues } = validateItems(ap.items);

  async function handleSubmit() {
    if (!valid) {
      toast.error(`Chưa đủ thông tin:\n${issues.slice(0, 3).join("\n")}`);
      return;
    }
    try {
      await submit.mutateAsync({ id: ap.id });
      toast.success("Đã nộp Action Plan");
    } catch { toast.error("Nộp thất bại"); }
  }

  async function handleReject() {
    if (!rejectNote.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    try {
      await reject.mutateAsync({ id: ap.id, reviewNote: rejectNote });
      toast.success("Đã từ chối Action Plan");
      setShowRejectForm(false);
      setRejectNote("");
    } catch { toast.error("Từ chối thất bại"); }
  }

  async function handleClose() {
    try {
      await close.mutateAsync({ id: ap.id });
      toast.success("Đã đóng Action Plan");
    } catch { toast.error("Đóng thất bại"); }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
      {canSubmit && (
        <div className="space-y-2">
          {!valid && (
            <ul className="text-xs text-warning space-y-0.5">
              {issues.slice(0, 5).map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          )}
          <Button
            data-testid="action-plan-submit-button"
            size="sm"
            onClick={handleSubmit}
            disabled={!valid || submit.isPending}
          >
            {submit.isPending ? "Đang nộp…" : "Nộp Action Plan"}
          </Button>
        </div>
      )}

      {canReview && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button data-testid="action-plan-close-button" size="sm" onClick={handleClose} disabled={close.isPending}>
              {close.isPending ? "Đang đóng…" : "Đóng Action Plan"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectForm((v) => !v)}
            >
              Từ chối
            </Button>
          </div>
          {showRejectForm && (
            <div className="space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                placeholder="Lý do từ chối..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={reject.isPending}>
                  Xác nhận từ chối
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowRejectForm(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
