"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ComboboxInput } from "@/shared/components";
import { useCriteria } from "@/features/criteria";
import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: ChecklistSection;
  allItems: ChecklistSectionItem[]; // all items across all sections (for uniqueness check)
  onAdd: (criteriaId: string) => Promise<void>;
}

export function AddCriteriaDialog({ open, onOpenChange, section, allItems, onAdd }: Props) {
  const [criteriaId, setCriteriaId] = useState("");
  const [loading, setLoading] = useState(false);

  // Load criteria belonging to this section's group, active only
  const { data: criteria = [] } = useCriteria({ groupId: section.groupId, isActive: true });

  // Exclude already-added criteria (uniqueness constraint)
  const usedIds = new Set(allItems.map((i) => i.criteriaId));
  const options = useMemo(() =>
    criteria
      .filter((c) => !usedIds.has(c.id))
      .map((c) => ({ value: c.id, label: `${c.code} — ${c.content.slice(0, 60)}${c.content.length > 60 ? "..." : ""}` })),
    [criteria, usedIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleAdd = async () => {
    if (!criteriaId) return;
    setLoading(true);
    try {
      await onAdd(criteriaId);
      setCriteriaId("");
      onOpenChange(false);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm tiêu chí vào section</DialogTitle>
          <DialogDescription>
            Section: <strong>{section.name}</strong> ({section.group?.code}) —
            chỉ hiện tiêu chí chưa có trong checklist này.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <ComboboxInput
            options={options}
            value={criteriaId}
            onChange={setCriteriaId}
            placeholder="Tìm tiêu chí..."
            emptyText={options.length === 0 ? "Không còn tiêu chí nào để thêm" : "Không tìm thấy"}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleAdd} disabled={loading || !criteriaId} className="bg-primary font-semibold">
            {loading ? "Đang thêm..." : "Thêm tiêu chí"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
