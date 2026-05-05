"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  useCreateCriteria, useUpdateCriteria, useCriteriaGroups,
} from "@/features/criteria";
import type { Criteria } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editItem?: Criteria | null;
}

export function CriteriaCrudSheet({ open, onClose, editItem }: Props) {
  const [code, setCode] = useState("");
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState("");
  const [deduction, setDeduction] = useState("5");
  const [maxDed, setMaxDed] = useState("15");
  const [flag, setFlag] = useState<"none" | "critical" | "risk">("none");

  const { data: groups = [] } = useCriteriaGroups();
  const createMut = useCreateCriteria();
  const updateMut = useUpdateCriteria();
  const isPending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (editItem) {
      setCode(editItem.code);
      setContent(editItem.content);
      setGroupId(editItem.groupId);
      setDeduction(String(editItem.deductionPerError));
      setMaxDed(String(editItem.maxDeduction));
      setFlag(editItem.flag);
    } else {
      setCode(""); setContent(""); setGroupId(""); setDeduction("5"); setMaxDed("15"); setFlag("none");
    }
  }, [editItem, open]);

  const handleSubmit = async () => {
    if (!code.trim() || !content.trim() || !groupId) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const payload = {
        code: code.trim(),
        content: content.trim(),
        groupId,
        deductionPerError: parseFloat(deduction),
        maxDeduction: parseFloat(maxDed),
        flag,
      };
      if (editItem) {
        await updateMut.mutateAsync({ id: editItem.id, ...payload });
        toast.success(`Criteria "${code}" updated`);
      } else {
        await createMut.mutateAsync(payload);
        toast.success(`Criteria "${code}" created`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>{editItem ? "Edit Criteria" : "New Criteria"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code <span className="text-danger">*</span></Label>
              <Input placeholder="e.g. A01" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Group <span className="text-danger">*</span></Label>
              <Select value={groupId} onValueChange={(v) => setGroupId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select group..." /></SelectTrigger>
                <SelectContent>
                  {groups.map((g: { id: string; code: string; name: string }) => (
                    <SelectItem key={g.id} value={g.id}>{g.code} — {g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-danger">*</span></Label>
            <Textarea placeholder="Criteria description..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>−/Error</Label>
              <Input type="number" value={deduction} onChange={(e) => setDeduction(e.target.value)} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Max Deduction</Label>
              <Input type="number" value={maxDed} onChange={(e) => setMaxDed(e.target.value)} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Flag</Label>
              <Select value={flag} onValueChange={(v) => setFlag(v as typeof flag)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standard</SelectItem>
                  <SelectItem value="critical">Critical (CCP)</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-end sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {editItem ? "Update" : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
