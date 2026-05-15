"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Send, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, ConfirmDialog } from "@/shared/components";
import {
  useChecklistDetail, useAddSection, useAddSectionItem,
  usePublishChecklist, useArchiveChecklist,
} from "@/features/checklist";
import { WeightSummaryBar } from "./_components/weight-summary-bar";
import { AddSectionDialog } from "./_components/add-section-dialog";
import { SectionCard } from "./_components/section-card";

const STATUS_BADGE: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived:  "bg-amber-100 text-amber-700",
};

export default function ChecklistBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const { data: checklist, isLoading } = useChecklistDetail(id);
  const addSection = useAddSection();
  const addSectionItem = useAddSectionItem();
  const publish = usePublishChecklist();
  const archive = useArchiveChecklist();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  if (!checklist) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy checklist</div>;

  const isDraft = checklist.status === "draft";
  const isPublished = checklist.status === "published";
  const sections = checklist.sections ?? [];
  const allItems = sections.flatMap((s) => s.items ?? []);
  const totalWeight = sections.reduce((sum, s) => sum + (s.weight ?? 0), 0);

  const handleAddSection = async (data: { name: string; groupId: string; weight: number }) => {
    try {
      await addSection.mutateAsync({ checklistId: id, ...data });
      toast.success("Đã thêm section");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const handleAddItem = async (sectionId: string, criteriaId: string) => {
    try {
      await addSectionItem.mutateAsync({ checklistId: id, sectionId, criteriaId });
      toast.success("Đã thêm tiêu chí");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); throw e; }
  };

  const handlePublish = async () => {
    // Client-side pre-validation
    const issues: string[] = [];
    if (sections.length === 0) issues.push("Cần ít nhất 1 section");
    const emptySection = sections.find((s) => (s.items?.length ?? 0) === 0);
    if (emptySection) issues.push(`Section "${emptySection.name}" chưa có tiêu chí`);
    if (totalWeight !== 100) issues.push(`Tổng trọng số = ${totalWeight}%, cần = 100%`);
    if (issues.length > 0) { toast.error(issues.join(" | ")); return; }
    try {
      await publish.mutateAsync(id);
      toast.success("Checklist đã được publish thành công");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
    setConfirmPublish(false);
  };

  const handleArchive = async () => {
    try {
      await archive.mutateAsync(id);
      toast.success("Checklist đã được lưu trữ");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
    setConfirmArchive(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={`${checklist.name} v${checklist.version}`}
        subtitle="Cấu hình sections, tiêu chí và trọng số cho checklist."
      >
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${STATUS_BADGE[checklist.status] ?? ""}`}>
            {checklist.status}
          </Badge>
          {isDraft && (
            <>
              <Button variant="outline" className="gap-2 h-9" onClick={() => setAddSectionOpen(true)}>
                <Plus className="h-4 w-4" /> Thêm section
              </Button>
              <Button className="bg-primary gap-2 h-9 font-semibold" onClick={() => setConfirmPublish(true)}>
                <Send className="h-4 w-4" /> Publish
              </Button>
            </>
          )}
          {isPublished && (
            <Button variant="outline" className="gap-2 h-9 text-amber-600 border-amber-300"
              onClick={() => setConfirmArchive(true)}>
              <Archive className="h-4 w-4" /> Lưu trữ
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Weight summary */}
      {sections.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Phân bổ trọng số
          </p>
          <WeightSummaryBar sections={sections} />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-white rounded-2xl border">
            <p className="font-medium">Chưa có section nào</p>
            <p className="text-sm mt-1">
              {isDraft ? "Nhấn + Thêm section để bắt đầu cấu hình." : "Checklist này không có section."}
            </p>
          </div>
        ) : (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <SectionCard
                key={section.id}
                section={section as typeof section & { items: typeof allItems }}
                allItems={allItems}
                isDraft={isDraft}
                onAddItem={handleAddItem}
              />
            ))
        )}
      </div>

      <AddSectionDialog
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        existingSections={sections}
        onAdd={handleAddSection}
      />

      <ConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Publish checklist?"
        description="Sau khi publish, checklist không thể chỉnh sửa thêm. Bạn có chắc chắn?"
        confirmLabel="Publish"
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Lưu trữ checklist?"
        description="Checklist đã lưu trữ không thể dùng để tạo kế hoạch audit mới."
        confirmLabel="Lưu trữ"
        onConfirm={handleArchive}
      />
    </div>
  );
}
