"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComboboxInput } from "@/shared/components";
import { useCriteriaGroups } from "@/features/criteria";
import type { ChecklistSection } from "@/shared/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSections: ChecklistSection[];
  onAdd: (data: { name: string; groupId: string; weight: number }) => Promise<void>;
}

export function AddSectionDialog({ open, onOpenChange, existingSections, onAdd }: Props) {
  const [groupId, setGroupId] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(20);
  const [loading, setLoading] = useState(false);

  const { data: groups = [] } = useCriteriaGroups();
  const groupOptions = groups.filter((g) => g.isActive).map((g) => ({ value: g.id, label: `${g.code} — ${g.name}` }));

  const usedWeight = existingSections.reduce((sum, s) => sum + (s.weight ?? 0), 0);
  const remaining = 100 - usedWeight;

  const handleGroupChange = (id: string) => {
    setGroupId(id);
    const g = groups.find((x) => x.id === id);
    if (g) setName(g.name);
  };

  const handleAdd = async () => {
    if (!groupId || !name.trim()) return;
    if (weight <= 0 || weight > remaining) return;
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), groupId, weight });
      setGroupId(""); setName(""); setWeight(20);
      onOpenChange(false);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm section vào checklist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nhóm tiêu chí *</label>
            <ComboboxInput options={groupOptions} value={groupId} onChange={handleGroupChange}
              placeholder="Chọn nhóm..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên section *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Tên hiển thị trên bài audit" className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Trọng số (%) * — còn lại: <span className={remaining <= 0 ? "text-red-600" : "text-green-600"}>{remaining}%</span>
            </label>
            <Input type="number" value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min={1} max={remaining} className="h-10 rounded-lg font-mono" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleAdd} disabled={loading || !groupId || weight <= 0 || weight > remaining}
            className="bg-primary font-semibold">
            {loading ? "Đang thêm..." : "Thêm section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
