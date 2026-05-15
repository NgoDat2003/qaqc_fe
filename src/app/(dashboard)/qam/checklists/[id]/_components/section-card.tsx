"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";
import { AddCriteriaDialog } from "./add-criteria-dialog";

const FLAG_STYLE: Record<string, string> = {
  none:     "bg-gray-100 text-gray-600",
  critical: "bg-red-100 text-red-700",
  risk:     "bg-amber-100 text-amber-700",
};

interface Props {
  section: ChecklistSection & { items: ChecklistSectionItem[] };
  allItems: ChecklistSectionItem[];
  isDraft: boolean;
  onAddItem: (sectionId: string, criteriaId: string) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onDeleteItem: (sectionId: string, itemId: string) => Promise<void>;
}

export function SectionCard({ section, allItems, isDraft, onAddItem, onDeleteSection, onDeleteItem }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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
              onClick={() => onDeleteSection(section.id)} title="Xóa section">
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
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3 group">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-14">
                    {item.criteria?.code ?? "—"}
                  </span>
                  <span className="text-sm text-foreground flex-1 leading-relaxed">
                    {item.criteria?.content}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      -{item.criteria?.deductionPerError}đ / -{item.criteria?.maxDeduction}đ
                    </span>
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

      <AddCriteriaDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        section={section}
        allItems={allItems}
        onAdd={(criteriaId) => onAddItem(section.id, criteriaId)}
      />
    </div>
  );
}
