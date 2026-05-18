"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ComboboxInput } from "@/shared/components";
import { useUpdateAssignment } from "@/features/audit/hooks/use-audit-plans";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";

interface ChangeAuditorDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  planId: string;
  assignmentId: string;
  currentAuditorId: string;
}

export function ChangeAuditorDialog({ open, onOpenChange, planId, assignmentId, currentAuditorId }: ChangeAuditorDialogProps) {
  const [auditorId, setAuditorId] = useState(currentAuditorId);
  const { data: qcs = [] } = useUsersByRole("qc_auditor");
  const update = useUpdateAssignment();

  useEffect(() => { if (open) setAuditorId(currentAuditorId); }, [open, currentAuditorId]);

  const options = qcs.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName }));

  const handleSubmit = async () => {
    if (!auditorId || auditorId === currentAuditorId) { onOpenChange(false); return; }
    try {
      await update.mutateAsync({ planId, assignmentId, auditorId });
      toast.success("Đã đổi QC phụ trách");
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Only pending assignment")) {
        toast.error("Assignment đã bắt đầu, không thể đổi QC");
      } else if (msg.includes("already has audit data")) {
        toast.error("Assignment đã có dữ liệu audit, không thể thay đổi");
      } else {
        toast.error(msg || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Đổi QC phụ trách</DialogTitle></DialogHeader>
        <div className="space-y-1.5 py-2">
          <label className="text-xs font-semibold text-muted-foreground">Chọn QC mới</label>
          <ComboboxInput options={options} value={auditorId} onChange={setAuditorId} placeholder="Chọn QC..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending || !auditorId}>
            {update.isPending ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
