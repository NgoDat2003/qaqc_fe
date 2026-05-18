"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatusBadge, SortableTable, RowActions, SearchInput } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { Criteria } from "@/shared/types";
import { useCriteriaGroups, useCriteria, useCreateCriteria, useUpdateCriteria } from "@/features/criteria";
import { CriteriaDrawer, type CriteriaFormValues } from "@/features/criteria/components/criteria-drawer";

const FLAG_STYLE: Record<string, { label: string; className: string }> = {
  none:     { label: "Bình thường", className: "bg-gray-100 text-gray-600" },
  critical: { label: "CCP",         className: "bg-red-100 text-red-700" },
  risk:     { label: "RISK",        className: "bg-amber-100 text-amber-700" },
};

export default function CriteriaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Criteria | null>(null);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: groups = [] } = useCriteriaGroups();
  const { data: allCriteria = [], isLoading } = useCriteria();
  const createCriteria = useCreateCriteria();
  const updateCriteria = useUpdateCriteria();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allCriteria.filter((c) => {
      const matchQ = !q || c.code.toLowerCase().includes(q) || c.content.toLowerCase().includes(q);
      const matchG = groupFilter === "all" || c.groupId === groupFilter;
      const matchS = statusFilter === "all" || (statusFilter === "active" ? c.isActive : !c.isActive);
      return matchQ && matchG && matchS;
    });
  }, [allCriteria, search, groupFilter, statusFilter]);

  const handleSubmit = async (data: CriteriaFormValues) => {
    try {
      if (editing) {
        await updateCriteria.mutateAsync({ id: editing.id, content: data.content, groupId: data.groupId, deductionPerError: data.deductionPerError, maxDeduction: data.maxDeduction, flag: data.flag, isActive: data.isActive });
        toast.success("Cập nhật tiêu chí thành công");
      } else {
        await createCriteria.mutateAsync(data);
        toast.success("Tạo tiêu chí thành công");
      }
      setDrawerOpen(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const handleToggle = useCallback(async (c: Criteria) => {
    try {
      await updateCriteria.mutateAsync({ id: c.id, isActive: !c.isActive });
      toast.success(c.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  }, [updateCriteria]);

  const openEdit = useCallback((c: Criteria) => { setEditing(c); setDrawerOpen(true); }, []);
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  const columns = useMemo((): SortableColumnDef<Criteria>[] => [
    {
      header: "Tiêu chí",
      sortKey: "code",
      cell: (c) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{c.code}</div>
          <div className="text-sm text-foreground line-clamp-2 mt-0.5">{c.content}</div>
        </div>
      ),
    },
    {
      header: "Nhóm",
      cell: (c) => <span className="text-sm font-medium">{c.group?.name ?? "—"}</span>,
      className: "w-28", hideOnMobile: true,
    },
    {
      header: "Trừ điểm",
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          -{c.deductionPerError}đ / tối đa -{c.maxDeduction}đ
        </span>
      ),
      className: "w-36", hideOnMobile: true,
    },
    {
      header: "Cờ",
      sortKey: "flag",
      cell: (c) => {
        const f = FLAG_STYLE[c.flag] ?? FLAG_STYLE.none;
        return <Badge className={`text-xs ${f.className}`}>{f.label}</Badge>;
      },
      className: "w-24",
    },
    {
      header: "Trạng thái",
      sortKey: "isActive",
      cell: (c) => <StatusBadge status={c.isActive ? "active" : "inactive"} />,
      className: "w-28",
    },
    {
      header: "",
      cell: (c) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEdit(c) },
          { label: c.isActive ? "Vô hiệu hóa" : "Kích hoạt", icon: c.isActive ? XCircle : CheckCircle2, onClick: () => handleToggle(c), variant: c.isActive ? "destructive" : "default" },
        ]} />
      ),
      className: "w-16",
    },
  ], [openEdit, handleToggle]);

  const initialData = editing ? {
    code: editing.code, content: editing.content, groupId: editing.groupId,
    deductionPerError: editing.deductionPerError, maxDeduction: editing.maxDeduction,
    flag: editing.flag, isActive: editing.isActive,
  } : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Thư viện tiêu chí" subtitle="Quản lý các tiêu chí kiểm tra cho hệ thống audit.">
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 gap-2 font-bold">
          <Plus className="h-4 w-4" /> Thêm tiêu chí
        </Button>
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-md border p-5 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo mã hoặc nội dung..." className="max-w-sm" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Nhóm:</span>
            <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v ?? "all")}>
              <SelectTrigger className="w-44 h-10 rounded-lg border-gray-200 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.code} — {g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Trạng thái:</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-40 h-10 rounded-lg border-gray-200 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SortableTable columns={columns} data={filtered} isLoading={isLoading}
          emptyTitle="Chưa có tiêu chí nào" emptyDescription="Tạo tiêu chí đầu tiên để bắt đầu." />
      </div>

      <CriteriaDrawer open={drawerOpen} onOpenChange={setDrawerOpen}
        onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
