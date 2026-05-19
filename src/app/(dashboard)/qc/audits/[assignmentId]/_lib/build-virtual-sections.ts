import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";

export type VirtualSection =
  | { kind: "regular"; id: string; label: string; tone: "default"; items: ChecklistSectionItem[] }
  | { kind: "ccp"; id: "virtual:ccp"; label: string; tone: "critical"; items: ChecklistSectionItem[] }
  | { kind: "risk"; id: "virtual:risk"; label: string; tone: "warning"; items: ChecklistSectionItem[] };

export function buildVirtualSections(sections: ChecklistSection[]): VirtualSection[] {
  // Regular sections: only items with flag === "none"
  const regulars: VirtualSection[] = sections.map((s) => ({
    kind: "regular" as const,
    id: s.id,
    label: s.group?.code ?? s.name,
    tone: "default" as const,
    items: (s.items ?? []).filter((i) => i.criteria?.flag === "none"),
  }));

  // Virtual tabs: gather flagged criteria across all sections
  const allItems = sections.flatMap((s) => s.items ?? []);
  const ccpItems = allItems.filter((i) => i.criteria?.flag === "critical");
  const riskItems = allItems.filter((i) => i.criteria?.flag === "risk");

  const virtuals: VirtualSection[] = [];
  if (ccpItems.length > 0) {
    virtuals.push({ kind: "ccp", id: "virtual:ccp", label: `CCP (${ccpItems.length})`, tone: "critical", items: ccpItems });
  }
  if (riskItems.length > 0) {
    virtuals.push({ kind: "risk", id: "virtual:risk", label: `RISK (${riskItems.length})`, tone: "warning", items: riskItems });
  }

  // Filter out regular sections that are empty after removing flagged items
  return [...regulars.filter((s) => s.items.length > 0), ...virtuals];
}
