"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArrowLeft, BookOpenCheck, Layers3, Plus, Scale, Send, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, MetricCard, StatusBadge } from "@/shared/components";
import type { AppStatus } from "@/shared/components";
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
  const totalCriteria = sections.reduce((sum, s) => sum + (s.items?.length ?? 0), 0);
  const emptySections = sections.filter((s) => (s.items?.length ?? 0) === 0).length;

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
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              render={<Link href="/qam/checklists" />}
            >
              <ArrowLeft className="h-4 w-4" />
              Checklist
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                  {checklist.name}
                </h1>
                <StatusBadge status={checklist.status as AppStatus} />
              </div>
              <p className="text-sm text-muted-foreground">
                Phiên bản v{checklist.version} · Cấu hình sections, tiêu chí và trọng số cho checklist.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <>
                <Button variant="outline" className="gap-2" onClick={() => setAddSectionOpen(true)}>
                  <Plus className="h-4 w-4" /> Thêm section
                </Button>
                <Button className="gap-2 bg-primary font-semibold hover:bg-primary-hover" onClick={() => setConfirmPublish(true)}>
                  <Send className="h-4 w-4" /> Publish
                </Button>
              </>
            )}
            {isPublished && (
              <Button
                variant="outline"
                className="gap-2 border-warning/30 text-warning hover:bg-warning-bg"
                onClick={() => setConfirmArchive(true)}
              >
                <Archive className="h-4 w-4" /> Lưu trữ
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sections" value={sections.length} icon={Layers3} description="Nhóm kiểm tra" />
        <MetricCard label="Tiêu chí" value={totalCriteria} icon={BookOpenCheck} variant="info" description="Trong checklist" />
        <MetricCard
          label="Trọng số"
          value={`${totalWeight}%`}
          icon={Scale}
          variant={totalWeight === 100 ? "success" : "warning"}
          description={totalWeight === 100 ? "Sẵn sàng publish" : "Cần đủ 100%"}
        />
        <MetricCard
          label="Section trống"
          value={emptySections}
          icon={ShieldAlert}
          variant={emptySections > 0 ? "warning" : "success"}
          description={emptySections > 0 ? "Cần bổ sung tiêu chí" : "Đã có tiêu chí"}
        />
      </div>

      {/* Weight summary */}
      {sections.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Phân bổ trọng số
          </p>
          <WeightSummaryBar sections={sections} />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
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
