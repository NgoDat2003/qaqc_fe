"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpdateAuditPlan } from "@/features/audit/hooks/use-audit-plans";
import type { AuditPlanFull } from "@/shared/types";

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan: AuditPlanFull;
}

export function EditPlanDialog({ open, onOpenChange, plan }: EditPlanDialogProps) {
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
      if (msg.includes("only update name and audit window")) {
        toast.error("Kế hoạch đang mở: chỉ có thể sửa tên và thời gian");
      } else {
        toast.error(msg || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Chỉnh sửa kế hoạch</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Tên kế hoạch</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên kế hoạch..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ngày bắt đầu</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ngày kết thúc</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
