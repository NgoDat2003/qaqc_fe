"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCriteria } from "@/features/criteria";
import type { ChecklistSection } from "@/shared/types";

interface SelectCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: ChecklistSection & { items: unknown[] };
  allChecklistCriteriaIds: string[];
  onAdd: (criteriaIds: string[]) => Promise<void>;
}

export function SelectCriteriaDialog({
  open,
  onOpenChange,
  section,
  allChecklistCriteriaIds,
  onAdd,
}: SelectCriteriaDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: criteria = [] } = useCriteria({ groupId: section.groupId, isActive: true });
  const usedSet = useMemo(() => new Set(allChecklistCriteriaIds), [allChecklistCriteriaIds]);

  const filtered = useMemo(() =>
    criteria.filter((c) => {
      if (c.flag !== "none") return false; // exclude CCP and RISK — handled in audit execution
      const q = search.toLowerCase();
      return !q || c.code.toLowerCase().includes(q) || c.content.toLowerCase().includes(q);
    }),
    [criteria, search]
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await onAdd([...selected]);
      setSelected(new Set());
      setSearch("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelected(new Set());
      setSearch("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm tiêu chí vào {section.name}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Tìm theo mã hoặc nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-80 overflow-y-auto space-y-1 py-1">
          {filtered.map((c) => {
            const isUsed = usedSet.has(c.id);
            const isSelected = selected.has(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-start gap-3 p-2 rounded-lg ${
                  isUsed ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isUsed}
                  onChange={() => !isUsed && toggle(c.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                  <p className="text-sm mt-0.5 line-clamp-2">{c.content}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  -{c.maxDeduction}đ
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">Không có tiêu chí</p>
          )}
        </div>
        {selected.size > 0 && (
          <p className="text-sm text-muted-foreground">Đã chọn: {selected.size} tiêu chí</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleAdd} disabled={selected.size === 0 || loading}>
            {loading ? "Đang thêm..." : `Thêm${selected.size > 0 ? ` ${selected.size}` : ""} tiêu chí`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
