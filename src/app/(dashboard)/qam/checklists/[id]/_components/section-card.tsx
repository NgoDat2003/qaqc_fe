"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";
import { SelectCriteriaDialog } from "./select-criteria-dialog";

const FLAG_STYLE: Record<string, string> = {
  none:     "bg-gray-100 text-gray-600",
  critical: "bg-red-100 text-red-700",
  risk:     "bg-amber-100 text-amber-700",
};

// Phase 5 — render multi-line criteria content with bullet support
function formatCriteriaContent(text: string): React.ReactNode {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length <= 1) return <span>{text}</span>;
  return (
    <ul className="space-y-0.5 list-none">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-1.5">
          {line.startsWith("-") ? (
            <>
              <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
              <span>{line.slice(1).trim()}</span>
            </>
          ) : (
            <span>{line}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  section: ChecklistSection & { items: ChecklistSectionItem[] };
  allCriteriaIds: string[];
  isDraft: boolean;
  onAddItems: (sectionId: string, criteriaIds: string[]) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onDeleteItem: (sectionId: string, itemId: string) => Promise<void>;
}

export function SectionCard({ section, allCriteriaIds, isDraft, onAddItems, onDeleteSection, onDeleteItem }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sum max deduction only for "none" flag criteria — CCP/RISK don't have dbase/dmax
  const totalMaxDeduction = section.items.reduce(
    (sum, item) => sum + (item.criteria?.flag === "none" ? (item.criteria?.maxDeduction ?? 0) : 0),
    0
  );

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
        <button onClick={() => setExpanded((v) => !v)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="flex-1">
          <span className="font-semibold text-sm text-foreground">{section.name}</span>
          <span className="ml-2 text-xs text-muted-foreground font-mono">
            {section.group?.code} · {section.weight}%
            {totalMaxDeduction > 0 && (
              <> · <span className="text-destructive">-{totalMaxDeduction}đ max</span></>
            )}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">{section.items.length} tiêu chí</Badge>
        {isDraft && (
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs rounded-lg"
              onClick={() => setAddOpen(true)}>
              <Plus className="h-3 w-3" /> Thêm tiêu chí
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)} title="Xóa section">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Items list */}
      {expanded && (
        <div className="divide-y divide-border/50">
          {section.items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Chưa có tiêu chí — {isDraft ? "nhấn + Thêm tiêu chí để thêm" : "section trống"}
            </p>
          ) : (
            section.items
              .slice().sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3 group">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-14">
                    {item.criteria?.code ?? "—"}
                  </span>
                  {/* Phase 5 — formatted multi-line content */}
                  <div className="text-sm text-foreground flex-1 leading-relaxed">
                    {item.criteria?.content
                      ? formatCriteriaContent(item.criteria.content)
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.criteria?.flag === "critical" ? (
                      <span className="text-xs font-medium text-red-600">Toàn nhóm về 0</span>
                    ) : item.criteria?.flag === "risk" ? (
                      <span className="text-xs font-medium text-amber-600">Toàn bài về 0</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        -{item.criteria?.deductionPerError}đ / -{item.criteria?.maxDeduction}đ
                      </span>
                    )}
                    {item.criteria?.flag && item.criteria.flag !== "none" && (
                      <Badge className={`text-[10px] ${FLAG_STYLE[item.criteria.flag]}`}>
                        {item.criteria.flag === "critical" ? "CCP" : "RISK"}
                      </Badge>
                    )}
                    {isDraft && (
                      <button
                        onClick={() => onDeleteItem(section.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Xóa tiêu chí"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Phase 3 — multi-select dialog */}
      <SelectCriteriaDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        section={section}
        allChecklistCriteriaIds={allCriteriaIds}
        onAdd={(criteriaIds: string[]) => onAddItems(section.id, criteriaIds)}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Xóa section "${section.name}"?`}
        description={`Section có ${section.items.length} tiêu chí sẽ bị xóa theo. Không thể hoàn tác.`}
        confirmLabel="Xóa section"
        onConfirm={() => { setConfirmDelete(false); onDeleteSection(section.id); }}
      />
    </div>
  );
}
