import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChecklistSummary, ChecklistDetail } from "@/shared/types";
import { checklistApi } from "../api/checklist.api";

export function useChecklists(status?: string) {
  return useQuery<ChecklistSummary[]>({
    queryKey: ["checklists", status],
    queryFn: () => checklistApi.getChecklists(status),
    staleTime: 30_000,
  });
}

export function useChecklistDetail(id: string) {
  return useQuery<ChecklistDetail>({
    queryKey: ["checklists", id],
    queryFn: () => checklistApi.getChecklist(id),
    enabled: !!id,
    staleTime: 0, // always fresh — builder edits happen frequently
  });
}

export function useCreateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; version: string }) =>
      checklistApi.createChecklist(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

export function useUpdateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; version?: string }) =>
      checklistApi.updateChecklist(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["checklists"] });
      qc.invalidateQueries({ queryKey: ["checklists", id] });
    },
  });
}

export function useAddSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, ...data }: { checklistId: string; name: string; groupId: string; weight: number; order?: number }) =>
      checklistApi.addSection(checklistId, data),
    onSuccess: (_, { checklistId }) =>
      qc.invalidateQueries({ queryKey: ["checklists", checklistId] }),
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, sectionId, ...data }: { checklistId: string; sectionId: string; name?: string; groupId?: string; weight?: number; order?: number }) =>
      checklistApi.updateSection(checklistId, sectionId, data),
    onSuccess: (_, { checklistId }) =>
      qc.invalidateQueries({ queryKey: ["checklists", checklistId] }),
  });
}

export function useAddSectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, sectionId, ...data }: { checklistId: string; sectionId: string; criteriaId: string; order?: number }) =>
      checklistApi.addSectionItem(checklistId, sectionId, data),
    onSuccess: (_, { checklistId }) =>
      qc.invalidateQueries({ queryKey: ["checklists", checklistId] }),
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, sectionId }: { checklistId: string; sectionId: string }) =>
      checklistApi.deleteSection(checklistId, sectionId),
    onSuccess: (_, { checklistId }) =>
      qc.invalidateQueries({ queryKey: ["checklists", checklistId] }),
  });
}

export function useDeleteSectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, sectionId, itemId }: { checklistId: string; sectionId: string; itemId: string }) =>
      checklistApi.deleteSectionItem(checklistId, sectionId, itemId),
    onSuccess: (_, { checklistId }) =>
      qc.invalidateQueries({ queryKey: ["checklists", checklistId] }),
  });
}

export function usePublishChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistApi.publishChecklist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

export function useArchiveChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistApi.archiveChecklist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}
