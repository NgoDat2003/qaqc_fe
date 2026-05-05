"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus, ChevronRight, Calendar, ClipboardList,
  Users, CheckCircle2, Clock, Loader2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuditPlans, useCreateAuditPlan } from "@/features/audit";
import { useChecklists } from "@/features/checklist";
import { useBrands, useStores, useUsers } from "@/features/master-data";
import type { AuditPlan, AuditAssignment, Brand, Store, User } from "@/shared/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AssignmentDraft = { storeId: string; auditorId: string; scheduledDate: string };
type PlanStatus = "open" | "closed";

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return status === "open" ? (
    <Badge className="bg-info-bg text-info border-info/20 text-xs font-medium gap-1">
      <Clock className="h-3 w-3" /> Open
    </Badge>
  ) : (
    <Badge className="bg-success-bg text-success border-success/20 text-xs font-medium gap-1">
      <CheckCircle2 className="h-3 w-3" /> Closed
    </Badge>
  );
}

function AssignmentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:     "bg-muted text-muted-foreground",
    in_progress: "bg-warning-bg text-warning border-warning/20",
    completed:   "bg-success-bg text-success border-success/20",
  };
  const labels: Record<string, string> = {
    pending: "Pending", in_progress: "In Progress", completed: "Completed",
  };
  return (
    <Badge className={`text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}>
      {labels[status] ?? status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
            i + 1 < step  ? "bg-primary text-primary-foreground" :
            i + 1 === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
            "bg-muted text-muted-foreground"
          }`}>
            {i + 1 < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 transition-colors ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Step {step} of {total}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Plan Sheet
// ---------------------------------------------------------------------------
function CreatePlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [planName, setPlanName] = useState("");
  const [formId, setFormId] = useState("");
  const [assignments, setAssignments] = useState<Record<string, AssignmentDraft>>({});
  const [storeSearch, setStoreSearch] = useState("");

  const { data: checklists = [] } = useChecklists("published");
  const { data: allStores = [] } = useStores();
  const { data: users = [] } = useUsers();
  const { data: brands = [] } = useBrands();
  const createPlan = useCreateAuditPlan();

  const qcAuditors = useMemo(
    () => (users as User[]).filter((u) =>
      u.roleAssignments?.some((r) => r.roleKey === "qc_auditor") && u.isActive
    ), [users]
  );

  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const storesByBrand = useMemo(() => {
    const q = storeSearch.toLowerCase();
    const filtered = (allStores as Store[]).filter((s) =>
      !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    const map: Record<string, { brand: Brand; stores: Store[] }> = {};
    (brands as Brand[]).forEach((b) => { map[b.id] = { brand: b, stores: [] }; });
    filtered.forEach((s) => { if (map[s.brandId]) map[s.brandId].stores.push(s); });
    return Object.values(map).filter((g) => g.stores.length > 0);
  }, [allStores, brands, storeSearch]);

  const selectedCount = Object.keys(assignments).length;

  const toggleStore = (storeId: string) => {
    setAssignments((prev) => {
      if (prev[storeId]) { const n = { ...prev }; delete n[storeId]; return n; }
      return { ...prev, [storeId]: { storeId, auditorId: "", scheduledDate: tomorrow } };
    });
  };

  const updateAssignment = (storeId: string, patch: Partial<AssignmentDraft>) =>
    setAssignments((prev) => ({ ...prev, [storeId]: { ...prev[storeId], ...patch } }));

  const canStep1 = planName.trim().length > 0 && formId.length > 0;
  const canStep2 = selectedCount > 0 &&
    Object.values(assignments).every((a) => a.auditorId && a.scheduledDate);

  const handleSubmit = async () => {
    try {
      await createPlan.mutateAsync({
        name: planName, formId,
        assignments: Object.values(assignments),
      } as Parameters<typeof createPlan.mutateAsync>[0]);
      toast.success(`Audit Plan "${planName}" created — ${selectedCount} store(s) assigned`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create plan");
    }
  };

  const handleClose = () => {
    setStep(1); setPlanName(""); setFormId("");
    setAssignments({}); setStoreSearch(""); onClose();
  };

  const getStoreName = (id: string) =>
    (allStores as Store[]).find((s) => s.id === id)?.name ?? id;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>Create Audit Plan</SheetTitle>
          <p className="text-sm text-muted-foreground">Ad-hoc · Company-wide scope</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepBar step={step} total={3} />

          {/* Step 1 — Plan Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Plan Name <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="e.g. May Surprise Inspection"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="h-10" autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Checklist Form <span className="text-danger">*</span>
                </label>
                <Select value={formId} onValueChange={(v) => setFormId(v ?? "")}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a published checklist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(checklists as Array<{ id: string; name: string; version: string }>).map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                          {f.name}
                          <Badge className="text-[10px] bg-muted text-muted-foreground ml-1">v{f.version}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                <p>• Type: <strong>Ad-hoc</strong> — no recurring schedule</p>
                <p>• Score hidden from QC until submission</p>
              </div>
            </div>
          )}

          {/* Step 2 — Store Assignment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select stores and assign QC auditor + date to each.
                </p>
                {selectedCount > 0 && (
                  <Badge className="bg-primary/10 text-primary">{selectedCount} selected</Badge>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search stores..." value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="pl-9 h-9 text-sm" />
              </div>
              <div className="space-y-4">
                {storesByBrand.map(({ brand, stores }) => (
                  <div key={brand.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {brand.name}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="space-y-1">
                      {stores.map((store) => {
                        const selected = !!assignments[store.id];
                        const asgn = assignments[store.id];
                        return (
                          <div key={store.id}>
                            <div
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                selected ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/30"
                              }`}
                              onClick={() => toggleStore(store.id)}
                            >
                              <Checkbox checked={selected}
                                onCheckedChange={() => toggleStore(store.id)}
                                onClick={(e) => e.stopPropagation()} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{store.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{store.code}</p>
                              </div>
                            </div>
                            {selected && (
                              <div className="ml-10 grid grid-cols-2 gap-2 mt-1 mb-1">
                                <Select value={asgn.auditorId}
                                  onValueChange={(v) => updateAssignment(store.id, { auditorId: v ?? "" })}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="QC Auditor..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {qcAuditors.map((u) => (
                                      <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <input type="date" value={asgn.scheduledDate} min={tomorrow}
                                  onChange={(e) => updateAssignment(store.id, { scheduledDate: e.target.value })}
                                  className="h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Plan</p>
                <p className="text-base font-semibold text-foreground">{planName}</p>
                <p className="text-sm text-muted-foreground">
                  {(checklists as Array<{ id: string; name: string }>).find((f) => f.id === formId)?.name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Assignments ({selectedCount} stores)
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs py-2">Store</TableHead>
                        <TableHead className="text-xs py-2">QC Auditor</TableHead>
                        <TableHead className="text-xs py-2">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(assignments).map((a) => (
                        <TableRow key={a.storeId}>
                          <TableCell className="py-2 text-sm">{getStoreName(a.storeId)}</TableCell>
                          <TableCell className="py-2 text-sm">
                            {qcAuditors.find((u) => u.id === a.auditorId)?.fullName ?? "—"}
                          </TableCell>
                          <TableCell className="py-2 text-sm text-muted-foreground">{a.scheduledDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-between sm:justify-between">
          <Button variant="outline" onClick={() => step === 1 ? handleClose() : setStep(step - 1)} className="h-10">
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
              className="h-10 gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createPlan.isPending} className="h-10 gap-2">
              {createPlan.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                : <><CheckCircle2 className="h-4 w-4" /> Create Plan</>
              }
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Plan Detail Dialog
// ---------------------------------------------------------------------------
function PlanDetailDialog({ plan, onClose }: { plan: AuditPlan | null; onClose: () => void }) {
  if (!plan) return null;
  type PlanWithForm = AuditPlan & { form?: { name: string; version: string } };
  type AssignmentWithDetails = AuditAssignment & {
    store?: { name: string; code: string };
    auditor?: { fullName: string };
    audit?: { finalScore: number; grade: string };
  };

  const assignments = (plan.assignments ?? []) as AssignmentWithDetails[];
  const completed = assignments.filter((a) => a.status === "completed").length;

  return (
    <Dialog open={!!plan} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            {plan.name}
            <PlanStatusBadge status={plan.status as PlanStatus} />
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {(plan as PlanWithForm).form?.name ?? "—"} · {assignments.length} store(s) · {completed}/{assignments.length} completed
          </p>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 mt-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold text-foreground py-2">Store</TableHead>
                <TableHead className="text-xs font-semibold text-foreground py-2">QC Auditor</TableHead>
                <TableHead className="text-xs font-semibold text-foreground py-2">Scheduled</TableHead>
                <TableHead className="text-xs font-semibold text-foreground py-2">Status</TableHead>
                <TableHead className="text-xs font-semibold text-foreground py-2 text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                    No assignments
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/20">
                    <TableCell className="py-3">
                      <p className="text-sm font-medium">{a.store?.name ?? a.storeId}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.store?.code}</p>
                    </TableCell>
                    <TableCell className="py-3 text-sm">{a.auditor?.fullName ?? "—"}</TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {new Date(a.scheduledDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3">
                      <AssignmentStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {a.audit ? (
                        <span className={`text-sm font-semibold ${
                          (a.audit.finalScore ?? 0) >= 85 ? "text-success" : "text-danger"
                        }`}>
                          {a.audit.finalScore?.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AuditPlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState<AuditPlan | null>(null);
  const [search, setSearch] = useState("");

  const { data: plans = [], isLoading } = useAuditPlans();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (plans as AuditPlan[]).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [plans, search]);

  const openCount = (plans as AuditPlan[]).filter((p) => p.status === "open").length;
  const totalAssignments = (plans as AuditPlan[]).reduce((s, p) => s + (p.assignments?.length ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage ad-hoc inspection plans.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 h-9 shrink-0">
          <Plus className="h-4 w-4" /> New Audit Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Plans", value: isLoading ? "—" : plans.length, icon: ClipboardList },
          { label: "Open Plans",  value: isLoading ? "—" : openCount,    icon: Clock },
          { label: "Assignments", value: isLoading ? "—" : totalAssignments, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search plans..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Plan</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Checklist</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-center">Stores</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Created</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j} className="py-3"><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  {search ? "No plans match your search." : (
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 opacity-30" />
                      <p>No audit plans yet.</p>
                      <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="mt-1">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Create first plan
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((plan) => {
                type PlanWithForm = AuditPlan & { form?: { name: string; version: string } };
                const p = plan as PlanWithForm;
                const assignments = (plan.assignments ?? []) as AuditAssignment[];
                const completed = assignments.filter((a) => a.status === "completed").length;
                return (
                  <TableRow key={plan.id} className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => setDetailPlan(plan)}>
                    <TableCell className="py-3">
                      <p className="text-sm font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">Ad-hoc · Company</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm text-foreground truncate max-w-[160px]">{p.form?.name ?? "—"}</p>
                      {p.form?.version && <p className="text-xs text-muted-foreground">v{p.form.version}</p>}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-semibold">{assignments.length}</span>
                      {assignments.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">{completed}/{assignments.length} done</p>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <PlanStatusBadge status={plan.status as PlanStatus} />
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                        onClick={() => setDetailPlan(plan)}>
                        Details <ChevronRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreatePlanSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      <PlanDetailDialog plan={detailPlan} onClose={() => setDetailPlan(null)} />
    </div>
  );
}
