import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { ChecklistForm, ChecklistSummary, ListResponse, ListParams } from "@/shared/types";
import { checklistApi } from "../api/checklist.api";

type ChecklistListParams = ListParams & { status?: string };

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export function useChecklists(params?: ChecklistListParams) {
  return useQuery<ListResponse<ChecklistSummary>>({
    queryKey: ["checklists", params],
    queryFn: () => checklistApi.getForms(params),
    placeholderData: keepPreviousData,
  });
}

export function useChecklist(id: string) {
  return useQuery({
    queryKey: ["checklists", id],
    queryFn: () => checklistApi.getForm(id),
    enabled: !!id,
  });
}

export function useCreateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<ChecklistForm, "name" | "version">) =>
      checklistApi.createForm(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

export function useUpdateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Pick<ChecklistForm, "name" | "version">> & { id: string }) =>
      checklistApi.updateForm(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

export function usePublishChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistApi.publishForm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

export function useArchiveChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistApi.archiveForm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists"] }),
  });
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function useAddSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      ...data
    }: { formId: string; name: string; groupId: string; order?: number }) =>
      checklistApi.addSection(formId, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["checklists", vars.formId] }),
  });
}

// ---------------------------------------------------------------------------
// Section Items
// ---------------------------------------------------------------------------

export function useAddSectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      sectionId,
      ...data
    }: { formId: string; sectionId: string; criteriaId: string; order?: number }) =>
      checklistApi.addItem(formId, sectionId, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["checklists", vars.formId] }),
  });
}
