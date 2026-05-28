"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/shared/components";
import { formatDateTime } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";
import {
  useCreateCorrectionRequest,
  useApproveCorrectionRequest,
  useRejectCorrectionRequest,
  useCreateActionPlan,
} from "@/features/audit";
import type { AuditResultDetail } from "@/shared/types";
import { CorrectionEditForm } from "./correction-edit-form";

interface CorrectionRequestPanelProps {
  audit: AuditResultDetail;
}

export function CorrectionRequestPanel({ audit }: CorrectionRequestPanelProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.activeRole);
  const [smReason, setSmReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const pendingRequest = audit.correctionRequests.find((r) => r.status === "pending");
  const hasPendingRequest = pendingRequest != null;
  const hasApprovedRequest = audit.correctionRequests.some((r) => r.status === "approved");

  const canSMRequest =
    role === "store_manager" &&
    !audit.actionPlan &&
    !hasPendingRequest &&
    audit.violations.length > 0;
  const canQAMApproveReject = role === "qa_manager" && hasPendingRequest && !!pendingRequest;
  const canQAMCorrect = role === "qa_manager" && hasApprovedRequest && !audit.actionPlan;
  const canCreateAP =
    !audit.actionPlan &&
    !hasPendingRequest &&
    audit.violations.length > 0 &&
    (role === "qa_manager" || role === "store_manager");

  const createRequest = useCreateCorrectionRequest();
  const approveRequest = useApproveCorrectionRequest();
  const rejectRequest = useRejectCorrectionRequest();
  const createAP = useCreateActionPlan();

  async function handleSMRequest() {
    if (!smReason.trim()) { toast.error("Vui lòng nhập lý do"); return; }
    try {
      await createRequest.mutateAsync({ auditId: audit.id, reason: smReason });
      toast.success("Đã gửi yêu cầu sửa chữa");
      setSmReason("");
    } catch { toast.error("Gửi yêu cầu thất bại"); }
  }

  async function handleApprove() {
    if (!pendingRequest) return;
    try {
      await approveRequest.mutateAsync({ requestId: pendingRequest.id, auditId: audit.id });
      toast.success("Đã duyệt yêu cầu sửa chữa");
    } catch { toast.error("Duyệt thất bại"); }
  }

  async function handleReject() {
    if (!pendingRequest) return;
    if (!rejectNote.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    try {
      await rejectRequest.mutateAsync({ requestId: pendingRequest.id, auditId: audit.id, reviewNote: rejectNote });
      toast.success("Đã từ chối yêu cầu");
      setShowRejectInput(false);
      setRejectNote("");
    } catch { toast.error("Từ chối thất bại"); }
  }

  async function handleCreateAP() {
    try {
      const ap = await createAP.mutateAsync({ auditId: audit.id });
      toast.success("Đã tạo Action Plan");
      router.push(`/action-plans/${ap.id}`);
    } catch { toast.error("Tạo Action Plan thất bại"); }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Yêu cầu sửa chữa & Action Plan</h2>

      {/* SM: request form */}
      {canSMRequest && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Lý do yêu cầu sửa</label>
          <textarea
            value={smReason}
            onChange={(e) => setSmReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do yêu cầu..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="sm"
            onClick={handleSMRequest}
            disabled={createRequest.isPending}
          >
            Gửi yêu cầu sửa chữa
          </Button>
        </div>
      )}

      {/* Pending badge for SM */}
      {hasPendingRequest && role === "store_manager" && (
        <div className="rounded-md bg-warning-bg border border-warning/20 px-3 py-2 text-sm text-warning font-medium">
          Yêu cầu sửa chữa đang chờ QA Manager xét duyệt
        </div>
      )}

      {/* QAM: approve/reject */}
      {canQAMApproveReject && pendingRequest && (
        <div className="space-y-3">
          <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">Lý do từ SM: </span>
            <span className="font-medium">{pendingRequest.reason}</span>
          </div>
          {showRejectInput ? (
            <div className="space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                placeholder="Lý do từ chối..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={rejectRequest.isPending}>Xác nhận từ chối</Button>
                <Button size="sm" variant="outline" onClick={() => setShowRejectInput(false)}>Hủy</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApprove} disabled={approveRequest.isPending}>Duyệt</Button>
              <Button size="sm" variant="outline" onClick={() => setShowRejectInput(true)}>Từ chối</Button>
            </div>
          )}
        </div>
      )}

      {/* QAM: inline correction form — keyed by editedAt so form remounts after correction applied */}
      {canQAMCorrect && (
        <CorrectionEditForm key={audit.editedAt ?? audit.id} audit={audit} />
      )}

      {/* Create AP button */}
      {canCreateAP && (
        <Button data-testid="create-action-plan-from-audit-button" size="sm" variant="outline" onClick={handleCreateAP} disabled={createAP.isPending}>
          Tạo Action Plan
        </Button>
      )}

      {/* AP link if exists */}
      {audit.actionPlan && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Action Plan:</span>
          <button
            onClick={() => router.push(`/action-plans/${audit.actionPlan!.id}`)}
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Xem Action Plan
          </button>
          <StatusBadge status={audit.actionPlan.status} />
        </div>
      )}

      {/* Correction history */}
      {audit.correctionRequests.length > 0 && (
        <div className="space-y-2 border-t border-border/40 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lịch sử yêu cầu</p>
          {audit.correctionRequests.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{formatDateTime(r.createdAt)}</span>
                {r.reviewNote && <span className="ml-2 italic text-muted-foreground">— {r.reviewNote}</span>}
              </div>
              <StatusBadge status={r.status as "pending" | "rejected"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
