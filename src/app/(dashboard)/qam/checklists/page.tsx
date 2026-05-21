"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MetricCard, PageHeader, SortableTable, StatusBadge } from "@/shared/components";
import type { AppStatus, SortableColumnDef } from "@/shared/components";
import type { ChecklistSummary } from "@/shared/types";
import { useChecklists, useCreateChecklist } from "@/features/checklist";

const STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const STATUS_FILTERS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default function ChecklistsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0");

  const { data: checklists = [], isLoading } = useChecklists();
  const createChecklist = useCreateChecklist();

  const counts = useMemo(() => ({
    draft: checklists.filter((checklist) => checklist.status === "draft").length,
    published: checklists.filter((checklist) => checklist.status === "published").length,
    archived: checklists.filter((checklist) => checklist.status === "archived").length,
  }), [checklists]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Tên checklist là bắt buộc");
      return;
    }

    try {
      const created = await createChecklist.mutateAsync({ name: name.trim(), version: version.trim() || "1.0" });
      toast.success("Tạo checklist thành công");
      setDialogOpen(false);
      setName("");
      setVersion("1.0");
      router.push(`/qam/checklists/${created.id}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const columns = useMemo((): SortableColumnDef<ChecklistSummary>[] => [
    {
      header: "Checklist",
      getSearchValue: (checklist) => `${checklist.name} ${checklist.version}`,
      cell: (checklist) => (
        <div>
          <div className="font-semibold text-foreground">{checklist.name}</div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">v{checklist.version}</div>
        </div>
      ),
    },
    {
      header: "Sections",
      getSortValue: (checklist) => checklist._count.sections,
      cell: (checklist) => <span className="text-sm font-semibold">{checklist._count.sections}</span>,
      className: "w-24",
    },
    {
      header: "Kế hoạch dùng",
      getSortValue: (checklist) => checklist._count.auditPlans,
      cell: (checklist) => <span className="text-sm text-muted-foreground">{checklist._count.auditPlans}</span>,
      className: "w-28",
      hideOnMobile: true,
    },
    {
      header: "Trạng thái",
      filterKey: "status",
      filterOptions: STATUS_FILTERS,
      cell: (checklist) => <StatusBadge status={checklist.status as AppStatus} />,
      className: "w-28",
    },
    {
      header: "",
      cell: (checklist) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg text-xs"
          onClick={() => router.push(`/qam/checklists/${checklist.id}`)}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Mở builder
        </Button>
      ),
      className: "w-28",
    },
  ], [router]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Checklist" subtitle="Quản lý bộ câu hỏi kiểm tra chất lượng của cửa hàng.">
        <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-primary font-bold hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Tạo checklist
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Draft" value={counts.draft} icon={FileText} />
        <MetricCard label="Đã publish" value={counts.published} icon={FileText} />
        <MetricCard label="Lưu trữ" value={counts.archived} icon={FileText} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <SortableTable
          columns={columns}
          data={checklists}
          isLoading={isLoading}
          emptyTitle="Chưa có checklist nào"
          emptyDescription="Tạo checklist đầu tiên để bắt đầu."
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo checklist mới</DialogTitle>
            <DialogDescription>Checklist sẽ được tạo ở trạng thái Draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên checklist *</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="VD: Checklist CHEP tháng 6" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phiên bản *</label>
              <Input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.0" className="h-10 rounded-lg font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={createChecklist.isPending} className="bg-primary font-semibold">
              {createChecklist.isPending ? "Đang tạo..." : "Tạo và mở builder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
