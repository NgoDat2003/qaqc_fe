"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Send, Archive } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, ConfirmDialog } from "@/shared/components";
import {
  useChecklistDetail, useAddSection, useAddSectionItem,
  useDeleteSection, useDeleteSectionItem,
  usePublishChecklist, useArchiveChecklist,
} from "@/features/checklist";
import { checklistApi } from "@/features/checklist/api/checklist.api";
import { useChecklistBuilderStore } from "@/stores/checklist-builder.store";
import { WeightSummaryBar } from "./_components/weight-summary-bar";
import { AddSectionDialog } from "./_components/add-section-dialog";
import { SectionCard } from "./_components/section-card";
import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";

const STATUS_BADGE: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived:  "bg-amber-100 text-amber-700",
};

export default function ChecklistBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const { data: serverChecklist, isLoading } = useChecklistDetail(id);
  const addSection = useAddSection();
  const addSectionItem = useAddSectionItem();
  const deleteSection = useDeleteSection();
  const deleteSectionItem = useDeleteSectionItem();
  const publish = usePublishChecklist();
  const archive = useArchiveChecklist();

  const {
    checklist,
    setChecklist,
    clearChecklist,
    optimisticAddSection,
    optimisticRemoveSection,
    optimisticAddItem,
    optimisticRemoveItem,
  } = useChecklistBuilderStore();

  // Sync server data → store; cleanup uses id-scoped clear to prevent race
  // when navigating quickly between checklists (avoids blanking next page)
  useEffect(() => {
    if (serverChecklist) setChecklist(serverChecklist);
    return () => clearChecklist(id);
  }, [serverChecklist, setChecklist, clearChecklist, id]);

  // Must be before early returns (rules-of-hooks)
  const allCriteriaIds = useMemo(
    () => (checklist?.sections ?? []).flatMap((s) => (s.items ?? []).map((i) => i.criteriaId)),
    [checklist]
  );

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  if (!checklist) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy checklist</div>;

  const isDraft = checklist.status === "draft";
  const isPublished = checklist.status === "published";
  const sections = checklist.sections ?? [];
  const totalWeight = sections.reduce((sum, s) => sum + (s.weight ?? 0), 0);

  // Revert helper — refetch from server and re-sync store
  const revertToServer = async () => {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["checklists", "detail", id],
      queryFn: () => checklistApi.getChecklist(id),
    });
    setChecklist(fresh);
  };

  const handleAddSection = async (data: { name: string; groupId: string; weight: number }) => {
    // Build a temporary section for optimistic UI
    const tempSection: ChecklistSection & { items: ChecklistSectionItem[] } = {
      id: `temp-${crypto.randomUUID()}`,
      formId: id,
      groupId: data.groupId,
      name: data.name,
      order: sections.length,
      weight: data.weight,
      items: [],
    };
    optimisticAddSection(tempSection);
    try {
      const updated = await addSection.mutateAsync({ checklistId: id, ...data });
      setChecklist(updated);
      toast.success("Đã thêm section");
    } catch (e: unknown) {
      await revertToServer();
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    optimisticRemoveSection(sectionId);
    try {
      const updated = await deleteSection.mutateAsync({ checklistId: id, sectionId });
      setChecklist(updated);
      toast.success("Đã xóa section");
    } catch (e: unknown) {
      await revertToServer();
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  const handleAddItems = async (sectionId: string, criteriaIds: string[]) => {
    // Optimistic: add temp items immediately
    criteriaIds.forEach((criteriaId) => {
      const tempItem: ChecklistSectionItem = {
        id: `temp-${criteriaId}-${crypto.randomUUID()}`,
        sectionId,
        criteriaId,
        order: 0,
      };
      optimisticAddItem(sectionId, tempItem);
    });
    try {
      // Sequential adds — each returns updated ChecklistDetail; use last result
      let updated = checklist;
      for (const criteriaId of criteriaIds) {
        updated = await addSectionItem.mutateAsync({ checklistId: id, sectionId, criteriaId });
      }
      setChecklist(updated);
      toast.success(`Đã thêm ${criteriaIds.length} tiêu chí`);
    } catch (e: unknown) {
      await revertToServer();
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
      throw e;
    }
  };

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    optimisticRemoveItem(sectionId, itemId);
    try {
      const updated = await deleteSectionItem.mutateAsync({ checklistId: id, sectionId, itemId });
      setChecklist(updated);
      toast.success("Đã xóa tiêu chí");
    } catch (e: unknown) {
      await revertToServer();
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  const handlePublish = async () => {
    const issues: string[] = [];
    if (sections.length === 0) issues.push("Cần ít nhất 1 section");
    const emptySection = sections.find((s) => (s.items?.length ?? 0) === 0);
    if (emptySection) issues.push(`Section "${emptySection.name}" chưa có tiêu chí`);
    if (totalWeight !== 100) issues.push(`Tổng trọng số = ${totalWeight}%, cần = 100%`);
    if (issues.length > 0) { toast.error(issues.join(" | ")); return; }
    try {
      const updated = await publish.mutateAsync(id);
      setChecklist(updated);
      toast.success("Checklist đã được publish thành công");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
    setConfirmPublish(false);
  };

  const handleArchive = async () => {
    try {
      const updated = await archive.mutateAsync(id);
      setChecklist(updated);
      toast.success("Checklist đã được lưu trữ");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
    setConfirmArchive(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={`${checklist.name} v${checklist.version}`}
        subtitle="Cấu hình sections, tiêu chí và trọng số cho checklist."
        backHref="/qam/checklists"
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
            .slice().sort((a, b) => a.order - b.order)
            .map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                allCriteriaIds={allCriteriaIds}
                isDraft={isDraft}
                onAddItems={(sectionId, criteriaIds) => handleAddItems(sectionId, criteriaIds)}
                onDeleteSection={handleDeleteSection}
                onDeleteItem={handleDeleteItem}
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
