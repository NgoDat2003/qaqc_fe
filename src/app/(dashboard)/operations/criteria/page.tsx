"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, AlertTriangle, Zap, Layers, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, SearchInput, DataTable, ConfirmDialog, RowActions, PaginationControls } from "@/shared/components";
import type { ColumnDef, RowAction } from "@/shared/components";
import {
  useCriteriaGroups, useDeleteCriteriaGroup,
  useCriteria, useDeleteCriteria,
} from "@/features/criteria";
import { GroupCrudSheet } from "@/features/criteria/components/group-crud-sheet";
import { CriteriaCrudSheet } from "@/features/criteria/components/criteria-crud-sheet";
import type { Criteria, CriteriaGroup } from "@/shared/types";

// ---------------------------------------------------------------------------
// Domain-specific helpers (not in shared)
// ---------------------------------------------------------------------------
function FlagBadge({ flag }: { flag: string }) {
  if (flag === "risk") return (
    <Badge className="bg-danger text-white text-[10px] font-semibold gap-1">
      <AlertTriangle className="h-3 w-3" /> Risk
    </Badge>
  );
  if (flag === "critical") return (
    <Badge className="bg-warning text-white text-[10px] font-semibold gap-1">
      <Zap className="h-3 w-3" /> CCP
    </Badge>
  );
  return <span className="text-xs text-muted-foreground">Standard</span>;
}

// ---------------------------------------------------------------------------
// Groups Tab
// ---------------------------------------------------------------------------
function GroupsTab() {
  const { data: groups = [], isLoading } = useCriteriaGroups();
  const deleteMut = useDeleteCriteriaGroup();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CriteriaGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CriteriaGroup | null>(null);

  const totalWeight = (groups as CriteriaGroup[]).reduce((s, g) => s + g.weight, 0);
  const weightOk = Math.abs(totalWeight - 1) < 0.01;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(`Group "${deleteTarget.code}" đã xóa`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    }
  };

  const columns = useMemo((): ColumnDef<CriteriaGroup>[] => [
    {
      header: "Mã",
      cell: (g) => <span className="font-mono font-semibold">{g.code}</span>,
      className: "w-20",
    },
    {
      header: "Tên nhóm",
      cell: (g) => <span className="text-sm">{g.name}</span>,
    },
    {
      header: "Trọng số",
      cell: (g) => (
        <Badge variant="outline" className="font-mono">{Math.round(g.weight * 100)}%</Badge>
      ),
      className: "w-24 text-center",
    },
    {
      header: "Màu",
      cell: (g) => (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border" style={{ backgroundColor: g.color ?? "#6b7280" }} />
          <span className="text-xs font-mono text-muted-foreground">{g.color}</span>
        </div>
      ),
      className: "w-36",
    },
    {
      header: "",
      cell: (g) => {
        const actions: RowAction[] = [
          { label: "Sửa", icon: Edit2, onClick: () => { setEditGroup(g); setSheetOpen(true); } },
          { label: "Xóa", icon: Trash2, onClick: () => setDeleteTarget(g), variant: "destructive" },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-40",
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Weight distribution bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Phân bổ trọng số
          </span>
          <Badge className={weightOk
            ? "bg-success-bg text-success border-success/20"
            : "bg-danger-bg text-danger border-danger/20"}>
            Tổng: {Math.round(totalWeight * 100)}%
          </Badge>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-muted gap-px">
          {(groups as CriteriaGroup[]).map((g) => (
            <div
              key={g.id}
              style={{ width: `${g.weight * 100}%`, backgroundColor: g.color ?? "#6b7280" }}
              className="rounded-sm transition-all"
              title={`${g.code}: ${Math.round(g.weight * 100)}%`}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {(groups as CriteriaGroup[]).map((g) => (
            <div key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: g.color ?? "#6b7280" }} />
              {g.code} ({Math.round(g.weight * 100)}%)
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{groups.length} nhóm</p>
        <Button size="sm" className="gap-1.5 h-8" onClick={() => { setEditGroup(null); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Thêm nhóm
        </Button>
      </div>

      <DataTable<CriteriaGroup>
        columns={columns}
        data={groups as CriteriaGroup[]}
        isLoading={isLoading}
        emptyTitle="Chưa có nhóm tiêu chí"
        emptyDescription="Thêm nhóm đầu tiên (C, H, P, E) để bắt đầu."
      />

      <GroupCrudSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditGroup(null); }} editGroup={editGroup} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Xóa nhóm "${deleteTarget?.code ?? ""}"?`}
        description="Hành động này không thể hoàn tác. Tất cả tiêu chí trong nhóm sẽ bị ảnh hưởng."
        onConfirm={handleDelete}
        isLoading={deleteMut.isPending}
        variant="destructive"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Criteria Tab
// ---------------------------------------------------------------------------
function CriteriaTab() {
  const { data: groups = [] } = useCriteriaGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: criteriaData, isLoading } = useCriteria({ page, limit: 20, groupId: selectedGroup ?? undefined });
  const criteria = criteriaData?.data ?? [];
  const criteriaMeta = criteriaData?.meta;
  const deleteMut = useDeleteCriteria();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Criteria | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Criteria | null>(null);

  useEffect(() => { setPage(1); }, [selectedGroup]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return criteria;
    return criteria.filter((c) =>
      c.code.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)
    );
  }, [criteria, search]);

  const groupMap = useMemo(
    () => Object.fromEntries((groups as CriteriaGroup[]).map((g) => [g.id, g])),
    [groups]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(`Tiêu chí "${deleteTarget.code}" đã xóa`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    }
  };

  const columns = useMemo((): ColumnDef<Criteria>[] => [
    {
      header: "Mã",
      cell: (c) => {
        const group = groupMap[c.groupId];
        return (
          <div>
            <div className="font-mono text-sm font-semibold">{c.code}</div>
            {group && <div className="text-[10px] text-muted-foreground mt-0.5">{group.code} — {group.name}</div>}
          </div>
        );
      },
      className: "w-32",
    },
    {
      header: "Nội dung",
      cell: (c) => <span className="text-sm leading-relaxed">{c.content}</span>,
    },
    {
      header: "−/Lỗi",
      cell: (c) => <span className="text-sm font-semibold text-danger">−{c.deductionPerError}</span>,
      className: "w-20 text-center",
    },
    {
      header: "Tối đa",
      hideOnMobile: true,
      cell: (c) => <span className="text-sm font-medium">{c.maxDeduction}</span>,
      className: "w-20 text-center",
    },
    {
      header: "Flag",
      cell: (c) => <FlagBadge flag={c.flag} />,
      className: "w-24",
    },
    {
      header: "",
      cell: (c) => {
        const actions: RowAction[] = [
          { label: "Sửa", icon: Edit2, onClick: () => { setEditItem(c); setSheetOpen(true); } },
          { label: "Xóa", icon: Trash2, onClick: () => setDeleteTarget(c), variant: "destructive" },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-40",
    },
  ], [groupMap]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo mã hoặc nội dung..."
          className="flex-1 min-w-56"
        />
        <Button size="sm" className="gap-1.5 h-9" onClick={() => { setEditItem(null); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Thêm tiêu chí
        </Button>
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGroup(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selectedGroup === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          Tất cả
        </button>
        {(groups as CriteriaGroup[]).map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id === selectedGroup ? null : g.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedGroup === g.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {g.code} — {g.name} <span className="ml-1 opacity-60">({Math.round(g.weight * 100)}%)</span>
          </button>
        ))}
      </div>

      <DataTable<Criteria>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle={search ? "Không tìm thấy tiêu chí" : "Chưa có tiêu chí"}
        emptyDescription={search ? "Thử thay đổi từ khóa tìm kiếm." : "Thêm tiêu chí đầu tiên để bắt đầu."}
        footerContent={
          criteriaMeta && criteriaMeta.totalPages > 1 ? (
            <PaginationControls page={criteriaMeta.page} totalPages={criteriaMeta.totalPages} total={criteriaMeta.total} onPageChange={setPage} />
          ) : (
            <p className="text-xs text-muted-foreground">
              {criteriaMeta?.total ?? filtered.length} tiêu chí {selectedGroup ? "trong nhóm được chọn" : "tổng cộng"}
            </p>
          )
        }
      />

      <CriteriaCrudSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditItem(null); }} editItem={editItem} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Xóa tiêu chí "${deleteTarget?.code ?? ""}"?`}
        description="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        isLoading={deleteMut.isPending}
        variant="destructive"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function CriteriaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý tiêu chí"
        subtitle="Quản lý nhóm tiêu chí (phân bổ trọng số) và thư viện tiêu chí kiểm tra."
      />
      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="groups" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
            <Layers className="h-4 w-4" /> Nhóm tiêu chí
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
            <ListChecks className="h-4 w-4" /> Thư viện tiêu chí
          </TabsTrigger>
        </TabsList>
        <TabsContent value="groups"><GroupsTab /></TabsContent>
        <TabsContent value="criteria"><CriteriaTab /></TabsContent>
      </Tabs>
    </div>
  );
}
