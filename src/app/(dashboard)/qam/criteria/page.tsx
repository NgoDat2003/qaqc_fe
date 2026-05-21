"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Edit2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, RowActions, SortableTable, StatusBadge } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { Criteria } from "@/shared/types";
import { useCreateCriteria, useCriteria, useCriteriaGroups, useUpdateCriteria } from "@/features/criteria";
import { CriteriaDrawer, type CriteriaFormValues } from "@/features/criteria/components/criteria-drawer";

const FLAG_STYLE: Record<string, { label: string; className: string }> = {
  none: { label: "Bình thường", className: "bg-muted text-muted-foreground border-border" },
  critical: { label: "CCP", className: "bg-danger-bg text-danger border-danger/20" },
  risk: { label: "RISK", className: "bg-warning-bg text-warning border-warning/20" },
};

const FLAG_FILTERS = Object.entries(FLAG_STYLE).map(([value, config]) => ({ value, label: config.label }));
const STATUS_FILTERS = [
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Vô hiệu hóa" },
];

export default function CriteriaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Criteria | null>(null);

  const { data: groups = [] } = useCriteriaGroups();
  const { data: allCriteria = [], isLoading } = useCriteria();
  const createCriteria = useCreateCriteria();
  const updateCriteria = useUpdateCriteria();

  const groupFilters = useMemo(
    () => [
      { value: "none", label: "Không có nhóm" },
      ...groups.map((group) => ({ value: group.id, label: `${group.code} — ${group.name}` })),
    ],
    [groups]
  );

  const handleSubmit = async (data: CriteriaFormValues) => {
    const groupId = data.flag === "risk" ? null : data.groupId || null;
    try {
      if (editing) {
        await updateCriteria.mutateAsync({
          id: editing.id,
          name: data.name,
          content: data.content,
          groupId,
          deductionPerError: data.deductionPerError,
          maxDeduction: data.maxDeduction,
          flag: data.flag,
          isActive: data.isActive,
        });
        toast.success("Cập nhật tiêu chí thành công");
      } else {
        await createCriteria.mutateAsync({ ...data, groupId });
        toast.success("Tạo tiêu chí thành công");
      }
      setDrawerOpen(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const handleToggle = useCallback(async (criteria: Criteria) => {
    try {
      await updateCriteria.mutateAsync({ id: criteria.id, isActive: !criteria.isActive });
      toast.success(criteria.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  }, [updateCriteria]);

  const openEdit = useCallback((criteria: Criteria) => {
    setEditing(criteria);
    setDrawerOpen(true);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const columns = useMemo((): SortableColumnDef<Criteria>[] => [
    {
      header: "Tiêu chí",
      getSearchValue: (criteria) => `${criteria.code} ${criteria.name} ${criteria.content}`,
      cell: (criteria) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{criteria.code}</div>
          <div className="mt-0.5 text-sm text-foreground">{criteria.name}</div>
        </div>
      ),
    },
    {
      header: "Nhóm",
      getFilterValue: (criteria) => criteria.groupId ?? "none",
      filterOptions: groupFilters,
      cell: (criteria) => <span className="text-sm font-medium">{criteria.group?.name ?? "—"}</span>,
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Trừ điểm",
      getSortValue: (criteria) => criteria.flag === "none" ? criteria.maxDeduction : Number.MAX_SAFE_INTEGER,
      cell: (criteria) => {
        if (criteria.flag === "critical") return <span className="text-xs font-medium text-danger">Toàn nhóm về 0</span>;
        if (criteria.flag === "risk") return <span className="text-xs font-medium text-warning">Toàn bài về 0</span>;
        return <span className="text-xs text-muted-foreground">-{criteria.deductionPerError}đ / tối đa -{criteria.maxDeduction}đ</span>;
      },
      className: "w-36",
      hideOnMobile: true,
    },
    {
      header: "Cờ",
      filterKey: "flag",
      filterOptions: FLAG_FILTERS,
      cell: (criteria) => {
        const flag = FLAG_STYLE[criteria.flag] ?? FLAG_STYLE.none;
        return <Badge className={`text-xs ${flag.className}`}>{flag.label}</Badge>;
      },
      className: "w-24",
    },
    {
      header: "Trạng thái",
      filterKey: "isActive",
      filterOptions: STATUS_FILTERS,
      cell: (criteria) => <StatusBadge status={criteria.isActive ? "active" : "inactive"} />,
      className: "w-28",
    },
    {
      header: "",
      cell: (criteria) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEdit(criteria) },
          {
            label: criteria.isActive ? "Vô hiệu hóa" : "Kích hoạt",
            icon: criteria.isActive ? XCircle : CheckCircle2,
            onClick: () => handleToggle(criteria),
            variant: criteria.isActive ? "destructive" : "default",
          },
        ]} />
      ),
      className: "w-16",
    },
  ], [groupFilters, handleToggle, openEdit]);

  const initialData = editing ? {
    code: editing.code,
    name: editing.name,
    content: editing.content,
    groupId: editing.groupId,
    deductionPerError: editing.deductionPerError,
    maxDeduction: editing.maxDeduction,
    flag: editing.flag,
    isActive: editing.isActive,
  } : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Thư viện tiêu chí" subtitle="Quản lý các tiêu chí kiểm tra cho hệ thống audit.">
        <Button onClick={openCreate} className="gap-2 bg-primary font-bold hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm tiêu chí
        </Button>
      </PageHeader>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <SortableTable
          columns={columns}
          data={allCriteria}
          isLoading={isLoading}
          emptyTitle="Chưa có tiêu chí nào"
          emptyDescription="Tạo tiêu chí đầu tiên để bắt đầu."
        />
      </div>

      <CriteriaDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
