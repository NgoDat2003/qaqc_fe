import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ChecklistDetail, ChecklistSection, ChecklistSectionItem } from "@/shared/types";

interface ChecklistBuilderStore {
  checklist: ChecklistDetail | null;
  setChecklist: (c: ChecklistDetail | null) => void;
  /** Safe cleanup: only clears if the current checklist matches the given id — prevents race when navigating between checklists */
  clearChecklist: (id: string) => void;
  optimisticAddSection: (section: ChecklistSection) => void;
  optimisticRemoveSection: (sectionId: string) => void;
  optimisticAddItem: (sectionId: string, item: ChecklistSectionItem) => void;
  optimisticRemoveItem: (sectionId: string, itemId: string) => void;
}

export const useChecklistBuilderStore = create<ChecklistBuilderStore>()(
  immer((set) => ({
    checklist: null,
    setChecklist: (c) =>
      set((state) => {
        state.checklist = c as ChecklistBuilderStore["checklist"];
      }),
    clearChecklist: (id) =>
      set((state) => {
        if (state.checklist?.id === id) state.checklist = null;
      }),
    optimisticAddSection: (section) =>
      set((state) => {
        state.checklist?.sections.push(section as ChecklistDetail["sections"][number]);
      }),
    optimisticRemoveSection: (sectionId) =>
      set((state) => {
        if (!state.checklist) return;
        state.checklist.sections = state.checklist.sections.filter(
          (s) => s.id !== sectionId
        );
      }),
    optimisticAddItem: (sectionId, item) =>
      set((state) => {
        const section = state.checklist?.sections.find((s) => s.id === sectionId);
        if (section) {
          section.items = [
            ...(section.items ?? []),
            item,
          ] as ChecklistDetail["sections"][number]["items"];
        }
      }),
    optimisticRemoveItem: (sectionId, itemId) =>
      set((state) => {
        const section = state.checklist?.sections.find((s) => s.id === sectionId);
        if (section) {
          section.items = (section.items ?? []).filter(
            (i) => i.id !== itemId
          ) as ChecklistDetail["sections"][number]["items"];
        }
      }),
  }))
);
