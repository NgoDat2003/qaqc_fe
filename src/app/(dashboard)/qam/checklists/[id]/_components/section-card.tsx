"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";
import { SelectCriteriaDialog } from "./select-criteria-dialog";

const FLAG_STYLE: Record<string, string> = {
  none:     "bg-muted text-muted-foreground border-border",
  critical: "bg-danger-bg text-danger border-danger/20",
  risk:     "bg-warning-bg text-warning border-warning/20",
};

// content format: "Title\n- Bullet1\n- Bullet2"; skipFirst=true khi name đã render riêng
function formatCriteriaContent(text: string, skipFirst?: boolean): React.ReactNode {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const display = skipFirst ? lines.slice(1) : lines;
  const bullets = display.map((l) => l.replace(/^-\s*/, ""));
  if (bullets.length === 0) return null;
  if (bullets.length === 1) return <span>{bullets[0]}</span>;
  return (
    <ul className="space-y-0.5">
      {bullets.map((p, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="text-muted-foreground shrink-0 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 block" />
          <span>{p}</span>
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Section header */}
      <div className="flex flex-col gap-3 border-b border-border bg-muted/35 px-4 py-3 sm:flex-row sm:items-center">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{section.name}</span>
            <Badge variant="outline" className="text-xs">{section.items.length} tiêu chí</Badge>
          </div>
          <span className="mt-1 block text-xs text-muted-foreground font-mono">
            {section.group?.code} · trọng số {section.weight}%
            {totalMaxDeduction > 0 && (
              <> · <span className="text-danger">-{totalMaxDeduction}đ max</span></>
            )}
          </span>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-info/20 bg-info-bg/40 text-info hover:bg-info-bg"
              onClick={() => setAddOpen(true)}>
              <Plus className="h-3 w-3" /> Thêm tiêu chí
            </Button>
            <Button size="icon-sm" variant="ghost" className="text-muted-foreground hover:bg-danger-bg hover:text-danger"
              onClick={() => setConfirmDelete(true)} title="Xóa section">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
                 <div key={item.id} className="group grid gap-3 px-4 py-3 sm:grid-cols-[72px_1fr_auto] sm:items-start">
                   <span className="w-fit rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                     {item.criteria?.code ?? "—"}
                   </span>
                  <div className="min-w-0 text-sm text-foreground leading-relaxed space-y-0.5">
                    {item.criteria?.name && (
                      <p className="font-semibold text-foreground">{item.criteria.name}</p>
                    )}
                    {item.criteria?.content
                      ? formatCriteriaContent(item.criteria.content, !!item.criteria.name)
                      : "—"}
                  </div>
                   <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {item.criteria?.flag === "critical" ? (
                       <span className="text-xs font-medium text-danger">Toàn nhóm về 0</span>
                     ) : item.criteria?.flag === "risk" ? (
                       <span className="text-xs font-medium text-warning">Toàn bài về 0</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        -{item.criteria?.deductionPerError}đ / -{item.criteria?.maxDeduction}đ
                      </span>
                    )}
                    {item.criteria?.flag && item.criteria.flag !== "none" && (
                       <Badge className={`border text-[10px] ${FLAG_STYLE[item.criteria.flag]}`}>
                        {item.criteria.flag === "critical" ? "CCP" : "RISK"}
                      </Badge>
                    )}
                    {isDraft && (
                      <button
                        onClick={() => onDeleteItem(section.id, item.id)}
                         className="text-muted-foreground transition-colors hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
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
