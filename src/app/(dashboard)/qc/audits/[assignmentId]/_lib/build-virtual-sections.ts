import type { AuditSession, ChecklistSection, ChecklistSectionItem } from "@/shared/types";

export type VirtualSection =
  | { kind: "regular"; id: string; label: string; tone: "default"; items: ChecklistSectionItem[] }
  | { kind: "ccp"; id: "virtual:ccp"; label: string; tone: "critical"; items: ChecklistSectionItem[] }
  | { kind: "risk"; id: "virtual:risk"; label: string; tone: "warning"; items: ChecklistSectionItem[] };

type RiskCriterion = NonNullable<AuditSession["riskCriteria"]>[number];

function riskCriterionToSectionItem(c: RiskCriterion): ChecklistSectionItem {
  return {
    id: `risk-item-${c.id}`,
    sectionId: "virtual:risk",
    criteriaId: c.id,
    criteria: {
      id: c.id,
      code: c.code,
      name: c.name,
      content: c.content,
      flag: c.flag,
      deductionPerError: c.deductionPerError,
      maxDeduction: c.maxDeduction,
      isActive: c.isActive,
      groupId: "",
      group: undefined,
      createdAt: "",
      updatedAt: "",
    },
    order: 0,
  };
}

export function buildVirtualSections(
  sections: ChecklistSection[],
  riskCriteria: RiskCriterion[] = []
): VirtualSection[] {
  // Regular sections: only items with flag === "none"
  const regulars: VirtualSection[] = sections.map((s) => ({
    kind: "regular" as const,
    id: s.id,
    label: s.group?.code ?? s.name,
    tone: "default" as const,
    items: (s.items ?? []).filter((i) => i.criteria?.flag === "none"),
  }));

  // CCP tab: from sections (CCP criteria belong to groups, live inside sections)
  const allItems = sections.flatMap((s) => s.items ?? []);
  const ccpItems = allItems.filter((i) => i.criteria?.flag === "critical");

  // RISK tab: from dedicated riskCriteria array (global, not in any section)
  const riskItems = riskCriteria.map(riskCriterionToSectionItem);

  const virtuals: VirtualSection[] = [];
  if (ccpItems.length > 0) {
    virtuals.push({ kind: "ccp", id: "virtual:ccp", label: `CCP (${ccpItems.length})`, tone: "critical", items: ccpItems });
  }
  if (riskItems.length > 0) {
    virtuals.push({ kind: "risk", id: "virtual:risk", label: `RISK (${riskItems.length})`, tone: "warning", items: riskItems });
  }

  return [...regulars.filter((s) => s.items.length > 0), ...virtuals];
}
