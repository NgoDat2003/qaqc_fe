"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader, SortableTable, MetricCard } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { ChecklistSummary } from "@/shared/types";
import { useChecklists, useCreateChecklist } from "@/features/checklist";
import { FileText } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived:  "bg-amber-100 text-amber-700",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", published: "Đã publish", archived: "Đã lưu trữ",
};

export default function ChecklistsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0");

  const { data: checklists = [], isLoading } = useChecklists();
  const createChecklist = useCreateChecklist();

  const filtered = useMemo(() =>
    statusFilter === "all" ? checklists : checklists.filter((c) => c.status === statusFilter),
    [checklists, statusFilter]
  );

  const counts = useMemo(() => ({
    draft:     checklists.filter((c) => c.status === "draft").length,
    published: checklists.filter((c) => c.status === "published").length,
    archived:  checklists.filter((c) => c.status === "archived").length,
  }), [checklists]);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Tên checklist là bắt buộc"); return; }
    try {
      const created = await createChecklist.mutateAsync({ name: name.trim(), version: version.trim() || "1.0" });
      toast.success("Tạo checklist thành công");
      setDialogOpen(false);
      setName(""); setVersion("1.0");
      router.push(`/qam/checklists/${created.id}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const columns = useMemo((): SortableColumnDef<ChecklistSummary>[] => [
    {
      header: "Checklist",
      sortKey: "name",
      cell: (c) => (
        <div>
          <div className="font-semibold text-foreground">{c.name}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">v{c.version}</div>
        </div>
      ),
    },
    {
      header: "Sections",
      cell: (c) => <span className="text-sm font-semibold">{c._count.sections}</span>,
      className: "w-24",
    },
    {
      header: "Kế hoạch dùng",
      cell: (c) => <span className="text-sm text-muted-foreground">{c._count.auditPlans}</span>,
      className: "w-28", hideOnMobile: true,
    },
    {
      header: "Trạng thái",
      sortKey: "status",
      cell: (c) => (
        <Badge className={`text-xs ${STATUS_BADGE[c.status] ?? ""}`}>
          {STATUS_LABEL[c.status] ?? c.status}
        </Badge>
      ),
      className: "w-28",
    },
    {
      header: "",
      cell: (c) => (
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs"
          onClick={() => router.push(`/qam/checklists/${c.id}`)}>
          <ExternalLink className="h-3.5 w-3.5" /> Mở builder
        </Button>
      ),
      className: "w-28",
    },
  ], [router]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Checklist" subtitle="Quản lý bộ câu hỏi kiểm tra chất lượng cửa hàng.">
        <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 gap-2 font-bold">
          <Plus className="h-4 w-4" /> Tạo checklist
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Draft" value={counts.draft} icon={FileText} />
        <MetricCard label="Đã publish" value={counts.published} icon={FileText} />
        <MetricCard label="Lưu trữ" value={counts.archived} icon={FileText} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-5 space-y-4">
        {/* Status filter tabs */}
        <div className="flex gap-2 border-b pb-3">
          {(["all", "draft", "published", "archived"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {s === "all" ? "Tất cả" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <SortableTable columns={columns} data={filtered} isLoading={isLoading}
          emptyTitle="Chưa có checklist nào" emptyDescription="Tạo checklist đầu tiên để bắt đầu." />
      </div>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo checklist mới</DialogTitle>
            <DialogDescription>Checklist sẽ được tạo ở trạng thái Draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên checklist *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="VD: Checklist CHEP tháng 6" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phiên bản *</label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0" className="h-10 rounded-lg font-mono" />
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
