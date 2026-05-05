"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  useCreateCriteriaGroup, useUpdateCriteriaGroup,
} from "@/features/criteria";
import type { CriteriaGroup } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editGroup?: CriteriaGroup | null;
}

export function GroupCrudSheet({ open, onClose, editGroup }: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const createMut = useCreateCriteriaGroup();
  const updateMut = useUpdateCriteriaGroup();
  const isPending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (editGroup) {
      setCode(editGroup.code);
      setName(editGroup.name);
      setWeight(String(Math.round(editGroup.weight * 100)));
      setColor(editGroup.color ?? "#3b82f6");
    } else {
      setCode(""); setName(""); setWeight(""); setColor("#3b82f6");
    }
  }, [editGroup, open]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim() || !weight.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    const w = parseFloat(weight) / 100;
    if (isNaN(w) || w <= 0 || w > 1) {
      toast.error("Weight must be between 1 and 100");
      return;
    }
    try {
      const payload = { code: code.trim(), name: name.trim(), weight: w, color };
      if (editGroup) {
        await updateMut.mutateAsync({ id: editGroup.id, ...payload });
        toast.success(`Group "${code}" updated`);
      } else {
        await createMut.mutateAsync(payload);
        toast.success(`Group "${code}" created`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save group");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>{editGroup ? "Edit Group" : "New Criteria Group"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label>Code <span className="text-danger">*</span></Label>
            <Input placeholder="e.g. C, H, P, E" value={code} onChange={(e) => setCode(e.target.value)} maxLength={5} />
          </div>
          <div className="space-y-2">
            <Label>Name <span className="text-danger">*</span></Label>
            <Input placeholder="e.g. ATVSTP" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weight (%) <span className="text-danger">*</span></Label>
            <Input type="number" placeholder="e.g. 30" value={weight} onChange={(e) => setWeight(e.target.value)} min={1} max={100} />
            <p className="text-xs text-muted-foreground">Total across all groups should equal 100%</p>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border border-border cursor-pointer" />
              <span className="text-sm text-muted-foreground font-mono">{color}</span>
            </div>
          </div>
        </div>
        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-end sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {editGroup ? "Update" : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
