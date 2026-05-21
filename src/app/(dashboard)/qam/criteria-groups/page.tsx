"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Edit2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, RowActions, SortableTable, StatusBadge } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { CriteriaGroup } from "@/shared/types";
import { useCreateCriteriaGroup, useCriteriaGroups, useUpdateCriteriaGroup } from "@/features/criteria";
import { CriteriaGroupDrawer, type CriteriaGroupFormValues } from "@/features/criteria/components/criteria-group-drawer";

function ColorDot({ color }: { color: string | null }) {
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? "#94a3b8" }}
    />
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
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const handleToggle = useCallback(async (group: CriteriaGroup) => {
    try {
      await updateGroup.mutateAsync({ id: group.id, isActive: !group.isActive });
      toast.success(group.isActive ? "Đã vô hiệu hóa nhóm" : "Đã kích hoạt nhóm");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  }, [updateGroup]);

  const openEdit = useCallback((group: CriteriaGroup) => {
    setEditing(group);
    setDrawerOpen(true);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const columns = useMemo((): SortableColumnDef<CriteriaGroup>[] => [
    {
      header: "Nhóm",
      getSearchValue: (group) => `${group.name} ${group.code}`,
      cell: (group) => (
        <div className="flex items-center gap-2.5">
          <ColorDot color={group.color ?? null} />
          <div>
            <div className="font-semibold text-foreground">{group.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{group.code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      filterKey: "isActive",
      filterOptions: [
        { value: "true", label: "Đang hoạt động" },
        { value: "false", label: "Vô hiệu hóa" },
      ],
      cell: (group) => <StatusBadge status={group.isActive ? "active" : "inactive"} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (group) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEdit(group) },
          {
            label: group.isActive ? "Vô hiệu hóa" : "Kích hoạt",
            icon: group.isActive ? XCircle : CheckCircle2,
            onClick: () => handleToggle(group),
            variant: group.isActive ? "destructive" : "default",
          },
        ]} />
      ),
      className: "w-16",
    },
  ], [handleToggle, openEdit]);

  const initialData = editing ? {
    code: editing.code,
    name: editing.name,
    color: editing.color ?? "#6366f1",
    isActive: editing.isActive,
  } : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Nhóm tiêu chí" subtitle="Quản lý các nhóm phân loại tiêu chí kiểm tra.">
        <Button onClick={openCreate} className="gap-2 bg-primary font-bold hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm nhóm
        </Button>
      </PageHeader>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <SortableTable
          columns={columns}
          data={groups}
          isLoading={isLoading}
          mobileCard={{
            leading: (group) => <ColorDot color={group.color ?? null} />,
            title: (group) => group.name,
            subtitle: (group) => group.code,
            badges: (group) => [
              <StatusBadge key="status" status={group.isActive ? "active" : "inactive"} />,
            ],
            actions: (group) => (
              <RowActions actions={[
                { label: "Sửa", icon: Edit2, onClick: () => openEdit(group) },
                {
                  label: group.isActive ? "Vô hiệu hóa" : "Kích hoạt",
                  icon: group.isActive ? XCircle : CheckCircle2,
                  onClick: () => handleToggle(group),
                  variant: group.isActive ? "destructive" : "default",
                },
              ]} />
            ),
          }}
          emptyTitle="Chưa có nhóm tiêu chí nào"
          emptyDescription="Tạo nhóm đầu tiên để bắt đầu."
        />
      </div>

      <CriteriaGroupDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
