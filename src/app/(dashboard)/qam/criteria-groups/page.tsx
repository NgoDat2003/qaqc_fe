"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge, SortableTable, RowActions } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { CriteriaGroup } from "@/shared/types";
import {
  useCriteriaGroups, useCreateCriteriaGroup, useUpdateCriteriaGroup,
} from "@/features/criteria";
import {
  CriteriaGroupDrawer,
  type CriteriaGroupFormValues,
} from "@/features/criteria/components/criteria-group-drawer";

function ColorDot({ color }: { color: string | null }) {
  return (
    <span className="inline-block w-3 h-3 rounded-full shrink-0"
      style={{ backgroundColor: color ?? "#94a3b8" }} />
  );
}

export default function CriteriaGroupsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CriteriaGroup | null>(null);

  const { data: groups = [], isLoading } = useCriteriaGroups();
  const createGroup = useCreateCriteriaGroup();
  const updateGroup = useUpdateCriteriaGroup();

  const handleSubmit = async (data: CriteriaGroupFormValues) => {
    try {
      if (editing) {
        await updateGroup.mutateAsync({ id: editing.id, name: data.name, color: data.color || null, isActive: data.isActive });
        toast.success("Cập nhật nhóm tiêu chí thành công");
      } else {
        await createGroup.mutateAsync({ code: data.code, name: data.name, color: data.color || null });
        toast.success("Tạo nhóm tiêu chí thành công");
      }
      setDrawerOpen(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const handleToggle = useCallback(async (g: CriteriaGroup) => {
    try {
      await updateGroup.mutateAsync({ id: g.id, isActive: !g.isActive });
      toast.success(g.isActive ? "Đã vô hiệu hóa nhóm" : "Đã kích hoạt nhóm");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  }, [updateGroup]);

  const openEdit = useCallback((g: CriteriaGroup) => { setEditing(g); setDrawerOpen(true); }, []);
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  const columns = useMemo((): SortableColumnDef<CriteriaGroup>[] => [
    {
      header: "Nhóm",
      sortKey: "name",
      cell: (g) => (
        <div className="flex items-center gap-2.5">
          <ColorDot color={g.color ?? null} />
          <div>
            <div className="font-semibold text-foreground">{g.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{g.code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      sortKey: "isActive",
      cell: (g) => <StatusBadge status={g.isActive ? "active" : "inactive"} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (g) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEdit(g) },
          {
            label: g.isActive ? "Vô hiệu hóa" : "Kích hoạt",
            icon: g.isActive ? XCircle : CheckCircle2,
            onClick: () => handleToggle(g),
            variant: g.isActive ? "destructive" : "default",
          },
        ]} />
      ),
      className: "w-16",
    },
  ], [openEdit, handleToggle]);

  const initialData = editing ? {
    code: editing.code, name: editing.name,
    color: editing.color ?? "#6366f1", isActive: editing.isActive,
  } : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Nhóm tiêu chí" subtitle="Quản lý các nhóm phân loại tiêu chí kiểm tra.">
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 gap-2 font-bold">
          <Plus className="h-4 w-4" /> Thêm nhóm
        </Button>
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-md border p-5">
        <SortableTable columns={columns} data={groups} isLoading={isLoading}
          emptyTitle="Chưa có nhóm tiêu chí nào" emptyDescription="Tạo nhóm đầu tiên để bắt đầu." />
      </div>

      <CriteriaGroupDrawer open={drawerOpen} onOpenChange={setDrawerOpen}
        onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
