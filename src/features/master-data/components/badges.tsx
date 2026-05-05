import { Badge } from "@/components/ui/badge";

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
      <div className="h-1 w-1 rounded-full bg-emerald-500" />
      Active
    </div>
  ) : (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
      <div className="h-1 w-1 rounded-full bg-slate-400" />
      Inactive
    </div>
  );
}

export function ModelBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="font-semibold text-[10px] uppercase tracking-tight border-slate-200 bg-slate-50/50 text-slate-600">
      {type === "cloud_kitchen" ? "Cloud Kitchen" : "Standard Store"}
    </Badge>
  );
}
