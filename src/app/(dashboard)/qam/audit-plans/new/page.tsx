"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader, ComboboxInput } from "@/shared/components";
import { useChecklists } from "@/features/checklist";
import { useCreateAuditPlan } from "@/features/audit";
import { useStores } from "@/features/master-data/hooks/use-stores";
import { useBrands } from "@/features/master-data/hooks/use-brands";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";
import { DRAWER_LABEL } from "@/shared/styles/drawer-form-styles";
import type { Store } from "@/shared/types";

interface AssignmentRow { key: string; storeId: string; auditorId: string }

const makeRow = (storeId = ""): AssignmentRow => ({
  key: crypto.randomUUID(), storeId, auditorId: "",
});

const today = new Date().toISOString().split("T")[0];
const DRAFT_KEY = "audit-plan-draft-v1";

export default function NewAuditPlanPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState("");
  const [checklistId, setChecklistId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState<AssignmentRow[]>([]);

  // Auto-save on change
  useEffect(() => {
    const hasContent = planName || checklistId || startDate || endDate || rows.length > 0;
    if (hasContent) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ planName, checklistId, startDate, endDate, rows }));
    }
  }, [planName, checklistId, startDate, endDate, rows]);

  // Restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { planName?: string; checklistId?: string; startDate?: string; endDate?: string; rows?: AssignmentRow[] };
      if (!d.planName && !d.rows?.length) { localStorage.removeItem(DRAFT_KEY); return; }
      toast("Có bản nháp chưa lưu", {
        description: "Khôi phục form đã điền trước đó?",
        action: { label: "Khôi phục", onClick: () => {
          if (d.planName) setPlanName(d.planName);
          if (d.checklistId) setChecklistId(d.checklistId);
          if (d.startDate) setStartDate(d.startDate);
          if (d.endDate) setEndDate(d.endDate);
          if (d.rows) setRows(d.rows);
        }},
        cancel: { label: "Bỏ qua", onClick: () => localStorage.removeItem(DRAFT_KEY) },
        duration: 8000,
      });
    } catch { localStorage.removeItem(DRAFT_KEY); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store selection dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");
  const [dialogBrandTab, setDialogBrandTab] = useState("all");
  const [dialogSelected, setDialogSelected] = useState<Set<string>>(new Set());

  const { data: checklists = [] } = useChecklists("published");
  const { data: stores = [] } = useStores();
  const { data: brands = [] } = useBrands();
  const { data: qcUsers = [] } = useUsersByRole("qc_auditor");
  const createPlan = useCreateAuditPlan();

  const checklistOptions = checklists.map((c) => ({ value: c.id, label: `${c.name} v${c.version}` }));
  const activeStores = stores.filter((s: Store) => s.isActive);
  const qcOptions = qcUsers.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName }));

  const selectedStoreIds = useMemo(() => new Set(rows.map((r) => r.storeId).filter(Boolean)), [rows]);

  const getRowStoreOptions = (rowKey: string) => {
    const ownId = rows.find((r) => r.key === rowKey)?.storeId;
    return activeStores
      .filter((s: Store) => !selectedStoreIds.has(s.id) || s.id === ownId)
      .map((s: Store) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
  };

  const dialogStores = useMemo(() => {
    const q = dialogSearch.toLowerCase();
    return activeStores.filter((s: Store) => {
      if (selectedStoreIds.has(s.id)) return false;
      if (dialogBrandTab !== "all" && s.brandId !== dialogBrandTab) return false;
      if (!q) return true;
      return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    });
  }, [activeStores, selectedStoreIds, dialogSearch, dialogBrandTab]);

  const availableBrands = useMemo(() => {
    const ids = new Set(activeStores.filter((s: Store) => !selectedStoreIds.has(s.id)).map((s: Store) => s.brandId));
    return brands.filter((b) => ids.has(b.id));
  }, [brands, activeStores, selectedStoreIds]);

  const allTabSelected = dialogStores.length > 0 && dialogStores.every((s) => dialogSelected.has(s.id));

  const handleSelectAll = () => {
    setDialogSelected((prev) => {
      const next = new Set(prev);
      if (allTabSelected) dialogStores.forEach((s) => next.delete(s.id));
      else dialogStores.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const toggleDialogStore = (id: string) => setDialogSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const openDialog = () => {
    setDialogSelected(new Set());
    setDialogSearch("");
    setDialogBrandTab("all");
    setDialogOpen(true);
  };

  const handleAddStores = () => {
    if (dialogSelected.size === 0) return;
    setRows((prev) => [...prev, ...[...dialogSelected].map((id) => makeRow(id))]);
    setDialogOpen(false);
  };

  const updateRow = (key: string, field: keyof AssignmentRow, value: string) =>
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, [field]: value } : r));

  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const handleSubmit = async () => {
    if (!planName.trim()) { toast.error("Tên kế hoạch là bắt buộc"); return; }
    if (!checklistId) { toast.error("Chọn checklist"); return; }
    if (!startDate) { toast.error("Chọn ngày bắt đầu"); return; }
    if (!endDate) { toast.error("Chọn ngày kết thúc"); return; }
    if (endDate < startDate) { toast.error("Ngày kết thúc phải sau ngày bắt đầu"); return; }
    if (rows.length === 0) { toast.error("Thêm ít nhất 1 cửa hàng"); return; }
    if (rows.some((r) => !r.storeId || !r.auditorId)) {
      toast.error("Chọn QC phụ trách cho tất cả cửa hàng"); return;
    }
    try {
      const newPlan = await createPlan.mutateAsync({
        name: planName.trim(),
        formId: checklistId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        assignments: rows.map((r) => ({ storeId: r.storeId, auditorId: r.auditorId })),
      });
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Đã tạo bản nháp kế hoạch audit");
      router.push(`/qam/audit-plans/${newPlan.id}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
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
            <div className="space-y-2">
              <label className={DRAWER_LABEL}>Ngày bắt đầu *</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                min={today} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className={DRAWER_LABEL}>Ngày kết thúc *</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today} className="h-10 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Phân công */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phân công cửa hàng</h3>
              {rows.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{rows.length} cửa hàng được chọn</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={openDialog}>
              <Plus className="h-3.5 w-3.5" /> Thêm cửa hàng
            </Button>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
              <p className="font-medium text-sm">Chưa có cửa hàng nào</p>
              <p className="text-xs mt-1">Nhấn + Thêm cửa hàng để chọn hàng loạt</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_1fr_36px] gap-3 text-xs font-semibold text-muted-foreground px-1">
                <span>Cửa hàng</span><span>QC phụ trách *</span><span />
              </div>
              {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[1fr_1fr_36px] gap-3 items-start">
                  <ComboboxInput options={getRowStoreOptions(row.key)} value={row.storeId}
                    onChange={(v) => updateRow(row.key, "storeId", v)} placeholder="Chọn cửa hàng..." />
                  <ComboboxInput options={qcOptions} value={row.auditorId}
                    onChange={(v) => updateRow(row.key, "auditorId", v)} placeholder="Chọn QC..." />
                  <Button variant="ghost" size="sm" className="h-10 w-9 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.key)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createPlan.isPending} className="bg-primary font-semibold min-w-[160px]">
            {createPlan.isPending ? "Đang tạo..." : "Tạo kế hoạch"}
          </Button>
        </div>
      </div>

      {/* Store selection dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chọn cửa hàng</DialogTitle>
          </DialogHeader>
          {availableBrands.length > 1 && (
            <div className="flex gap-1.5 flex-wrap border-b pb-2 -mx-1 px-1">
              <button onClick={() => setDialogBrandTab("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${dialogBrandTab === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                Tất cả
              </button>
              {availableBrands.map((b) => (
                <button key={b.id} onClick={() => setDialogBrandTab(b.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${dialogBrandTab === b.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                  {b.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Input placeholder="Tìm theo mã hoặc tên..." value={dialogSearch}
              onChange={(e) => setDialogSearch(e.target.value)} className="flex-1 h-9" />
            {dialogStores.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll} className="shrink-0 h-9 text-xs">
                {allTabSelected ? "Bỏ chọn tất cả" : `Chọn ${dialogStores.length} CH`}
              </Button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5 py-1">
            {dialogStores.map((s: Store) => (
              <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted">
                <input type="checkbox" checked={dialogSelected.has(s.id)}
                  onChange={() => toggleDialogStore(s.id)} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{s.code}</span>
                  <p className="text-sm truncate">{s.name}</p>
                </div>
              </label>
            ))}
            {dialogStores.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                {activeStores.length === selectedStoreIds.size ? "Đã chọn tất cả cửa hàng" : "Không tìm thấy cửa hàng"}
              </p>
            )}
          </div>
          {dialogSelected.size > 0 && (
            <p className="text-sm text-muted-foreground">Đã chọn: {dialogSelected.size} cửa hàng</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddStores} disabled={dialogSelected.size === 0}>
              Thêm {dialogSelected.size > 0 ? `${dialogSelected.size} ` : ""}cửa hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
