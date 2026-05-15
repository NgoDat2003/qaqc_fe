"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, ComboboxInput } from "@/shared/components";
import { useChecklists } from "@/features/checklist";
import { useCreateAuditPlan } from "@/features/audit";
import { useStores } from "@/features/master-data/hooks/use-stores";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";
import { DRAWER_LABEL } from "@/shared/styles/drawer-form-styles";

interface AssignmentRow { key: string; storeId: string; auditorId: string; scheduledDate: string }

const newRow = (): AssignmentRow => ({
  key: crypto.randomUUID(), storeId: "", auditorId: "", scheduledDate: "",
});

export default function NewAuditPlanPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState("");
  const [checklistId, setChecklistId] = useState("");
  const [rows, setRows] = useState<AssignmentRow[]>([newRow()]);

  const { data: checklists = [] } = useChecklists("published");
  const { data: stores = [] } = useStores();
  const { data: qcUsers = [] } = useUsersByRole("qc_auditor");
  const createPlan = useCreateAuditPlan();

  const checklistOptions = checklists.map((c) => ({ value: c.id, label: `${c.name} v${c.version}` }));
  const storeOptions = stores.filter((s) => s.isActive).map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
  const qcOptions = qcUsers.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName }));

  const updateRow = (key: string, field: keyof AssignmentRow, value: string) =>
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, [field]: value } : r));
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  // Validate duplicate stores
  const usedStores = rows.map((r) => r.storeId).filter(Boolean);
  const duplicateStores = new Set(usedStores.filter((id, i) => usedStores.indexOf(id) !== i));

  const handleSubmit = async () => {
    if (!planName.trim()) { toast.error("Tên kế hoạch là bắt buộc"); return; }
    if (!checklistId) { toast.error("Chọn checklist"); return; }
    const incomplete = rows.some((r) => !r.storeId || !r.auditorId || !r.scheduledDate);
    if (incomplete) { toast.error("Điền đủ thông tin cho tất cả phân công"); return; }
    if (duplicateStores.size > 0) { toast.error("Không được chọn cùng 1 cửa hàng 2 lần"); return; }

    try {
      await createPlan.mutateAsync({
        name: planName.trim(),
        formId: checklistId,
        assignments: rows.map((r) => ({
          storeId: r.storeId,
          auditorId: r.auditorId,
          scheduledDate: new Date(r.scheduledDate).toISOString(),
        })),
      });
      toast.success("Tạo kế hoạch audit thành công");
      router.push("/qam/audit-plans");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title="Tạo kế hoạch Audit" subtitle="Chọn checklist, phân công QC và lịch kiểm tra." />

      {/* Thông tin chung */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Thông tin chung</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className={DRAWER_LABEL}>Tên kế hoạch *</label>
            <Input value={planName} onChange={(e) => setPlanName(e.target.value)}
              placeholder="VD: Kiểm tra CHEP tháng 6/2026" className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <label className={DRAWER_LABEL}>Checklist *</label>
            <ComboboxInput options={checklistOptions} value={checklistId} onChange={setChecklistId}
              placeholder="Chọn checklist đã publish..." />
          </div>
        </div>
      </div>

      {/* Phân công */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phân công cửa hàng</h3>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => setRows((p) => [...p, newRow()])}>
            <Plus className="h-3.5 w-3.5" /> Thêm cửa hàng
          </Button>
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_180px_36px] gap-3 text-xs font-semibold text-muted-foreground px-1">
            <span>Cửa hàng *</span><span>QC phụ trách *</span><span>Ngày kiểm tra *</span><span />
          </div>

          {rows.map((row) => (
            <div key={row.key} className={`grid grid-cols-[1fr_1fr_180px_36px] gap-3 items-start ${duplicateStores.has(row.storeId) ? "ring-1 ring-destructive rounded-lg p-1" : ""}`}>
              <ComboboxInput options={storeOptions} value={row.storeId}
                onChange={(v) => updateRow(row.key, "storeId", v)}
                placeholder="Chọn cửa hàng..." />
              <ComboboxInput options={qcOptions} value={row.auditorId}
                onChange={(v) => updateRow(row.key, "auditorId", v)}
                placeholder="Chọn QC..." />
              <Input type="date" value={row.scheduledDate}
                onChange={(e) => updateRow(row.key, "scheduledDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-10 rounded-lg" />
              <Button variant="ghost" size="sm" className="h-10 w-9 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(row.key)} disabled={rows.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
        <Button onClick={handleSubmit} disabled={createPlan.isPending} className="bg-primary font-semibold min-w-[160px]">
          {createPlan.isPending ? "Đang tạo..." : "Tạo kế hoạch"}
        </Button>
      </div>
    </div>
  );
}
