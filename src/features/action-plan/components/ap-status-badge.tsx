"use client";
import { Badge } from "@/components/ui/badge";
import type { ActionPlanStatus } from "@/shared/types";

const STATUS_META: Record<ActionPlanStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground border-transparent" },
  submitted: { label: "Submitted", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected:  { label: "Rejected",  cls: "bg-red-50 text-red-700 border-red-200" },
  closed:    { label: "Closed",    cls: "bg-green-50 text-green-700 border-green-200" },
};

export function APStatusBadge({ status }: { status: ActionPlanStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={`text-xs font-medium border ${meta.cls}`}>{meta.label}</Badge>;
}
