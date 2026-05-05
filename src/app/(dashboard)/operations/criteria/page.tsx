"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Edit2, Trash2, MoreVertical,
  AlertTriangle, Zap, Layers, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/shared/components/page-header";
import {
  useCriteriaGroups, useDeleteCriteriaGroup,
  useCriteria, useDeleteCriteria,
} from "@/features/criteria";
import { GroupCrudSheet } from "@/features/criteria/components/group-crud-sheet";
import { CriteriaCrudSheet } from "@/features/criteria/components/criteria-crud-sheet";
import type { Criteria, CriteriaGroup } from "@/shared/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function FlagBadge({ flag }: { flag: string }) {
  if (flag === "risk") return (
    <Badge className="bg-danger text-white text-[10px] font-semibold gap-1">
      <AlertTriangle className="h-3 w-3" /> Risk
    </Badge>
  );
  if (flag === "critical") return (
    <Badge className="bg-warning text-white text-[10px] font-semibold gap-1">
      <Zap className="h-3 w-3" /> CCP
    </Badge>
  );
  return <span className="text-xs text-muted-foreground">Standard</span>;
}

function ConfirmDeleteDialog({
  open, onClose, onConfirm, label, isPending,
}: { open: boolean; onClose: () => void; onConfirm: () => void; label: string; isPending: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Groups Tab
// ---------------------------------------------------------------------------
function GroupsTab() {
  const { data: groups = [], isLoading } = useCriteriaGroups();
  const deleteMut = useDeleteCriteriaGroup();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CriteriaGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CriteriaGroup | null>(null);

  const totalWeight = groups.reduce((s: number, g: CriteriaGroup) => s + g.weight, 0);
  const weightOk = Math.abs(totalWeight - 1) < 0.01;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(`Group "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Weight summary bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Weight Distribution
          </span>
          <Badge className={weightOk
            ? "bg-success-bg text-success border-success/20"
            : "bg-danger-bg text-danger border-danger/20"}>
            Total: {Math.round(totalWeight * 100)}%
          </Badge>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-muted gap-px">
          {groups.map((g: CriteriaGroup) => (
            <div
              key={g.id}
              style={{ width: `${g.weight * 100}%`, backgroundColor: g.color ?? "#6b7280" }}
              className="rounded-sm transition-all"
              title={`${g.code}: ${Math.round(g.weight * 100)}%`}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {groups.map((g: CriteriaGroup) => (
            <div key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: g.color ?? "#6b7280" }} />
              {g.code} ({Math.round(g.weight * 100)}%)
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{groups.length} group(s)</p>
        <Button size="sm" className="gap-1.5 h-8" onClick={() => { setEditGroup(null); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add Group
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-center">Weight</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-center">Color</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                  No groups yet. Add your first group (e.g. C, H, P, E).
                </TableCell>
              </TableRow>
            ) : (
              groups.map((g: CriteriaGroup) => (
                <TableRow key={g.id} className="hover:bg-muted/20">
                  <TableCell className="py-3 font-mono font-semibold text-sm">{g.code}</TableCell>
                  <TableCell className="py-3 text-sm">{g.name}</TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge variant="outline" className="font-mono">{Math.round(g.weight * 100)}%</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded border" style={{ backgroundColor: g.color ?? "#6b7280" }} />
                      <span className="text-xs font-mono text-muted-foreground">{g.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-7 w-7 p-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => { setEditGroup(g); setSheetOpen(true); }}>
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm text-danger focus:text-danger cursor-pointer" onClick={() => setDeleteTarget(g)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <GroupCrudSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditGroup(null); }} editGroup={editGroup} />
      <ConfirmDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label={deleteTarget?.code ?? ""} isPending={deleteMut.isPending} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Criteria Tab
// ---------------------------------------------------------------------------
function CriteriaTab() {
  const { data: groups = [] } = useCriteriaGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: criteria = [], isLoading } = useCriteria(selectedGroup ?? undefined);
  const deleteMut = useDeleteCriteria();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Criteria | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Criteria | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return criteria;
    return criteria.filter((c: Criteria) =>
      c.code.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)
    );
  }, [criteria, search]);

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g: CriteriaGroup) => [g.id, g])),
    [groups]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(`Criteria "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by code or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Button size="sm" className="gap-1.5 h-9" onClick={() => { setEditItem(null); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add Criteria
        </Button>
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedGroup(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selectedGroup === null ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
          }`}>All</button>
        {groups.map((g: CriteriaGroup) => (
          <button key={g.id} onClick={() => setSelectedGroup(g.id === selectedGroup ? null : g.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedGroup === g.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
            }`}>
            {g.code} — {g.name} <span className="ml-1 opacity-60">({Math.round(g.weight * 100)}%)</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Description</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-center">−/Error</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-center">Max</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Flag</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                  {search ? "No criteria match your search." : "No criteria yet. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c: Criteria) => {
                const group = groupMap[c.groupId];
                return (
                  <TableRow key={c.id} className="hover:bg-muted/20">
                    <TableCell className="py-3">
                      <div className="font-mono text-sm font-semibold">{c.code}</div>
                      {group && <div className="text-[10px] text-muted-foreground mt-0.5">{group.code} — {group.name}</div>}
                    </TableCell>
                    <TableCell className="py-3 max-w-md text-sm leading-relaxed">{c.content}</TableCell>
                    <TableCell className="py-3 text-center text-sm font-semibold text-danger">−{c.deductionPerError}</TableCell>
                    <TableCell className="py-3 text-center text-sm font-medium">{c.maxDeduction}</TableCell>
                    <TableCell className="py-3"><FlagBadge flag={c.flag} /></TableCell>
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-7 w-7 p-0"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => { setEditItem(c); setSheetOpen(true); }}>
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-sm text-danger focus:text-danger cursor-pointer" onClick={() => setDeleteTarget(c)}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">{filtered.length} criteria {selectedGroup ? "in selected group" : "total"}</p>
        </div>
      </div>

      <CriteriaCrudSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditItem(null); }} editItem={editItem} />
      <ConfirmDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label={deleteTarget?.code ?? ""} isPending={deleteMut.isPending} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page — 2 Tabs
// ---------------------------------------------------------------------------
export default function CriteriaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Criteria Management"
        subtitle="Manage criteria groups (weight distribution) and individual assessment criteria."
      />

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="groups" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
            <Layers className="h-4 w-4" /> Criteria Groups
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
            <ListChecks className="h-4 w-4" /> Criteria Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <GroupsTab />
        </TabsContent>

        <TabsContent value="criteria">
          <CriteriaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
