"use client";

import { useState, useMemo } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrands, useStores } from "@/features/master-data";
import { PageHeader } from "@/shared/components/page-header";
import type { Brand, Store } from "@/shared/types";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-success-bg text-success border-success/20 font-medium text-xs">Active</Badge>
  ) : (
    <Badge className="bg-danger-bg text-danger border-danger/20 font-medium text-xs">Inactive</Badge>
  );
}

function ModelBadge({ type }: { type: string }) {
  return type === "cloud_kitchen" ? (
    <Badge className="bg-info-bg text-info border-info/20 text-xs font-medium">Cloud Kitchen</Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground text-xs font-medium">Standard</Badge>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brands tab
// ---------------------------------------------------------------------------
function BrandsTab() {
  const { data: brands = [], isLoading, refetch } = useBrands();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() =>
    brands.filter(b => statusFilter === "all" || String(b.isActive) === statusFilter),
    [brands, statusFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage brands and their operational owners.
        </p>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" /> New Brand
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide">Brand</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide w-28">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide w-32">Updated</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton cols={4} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10 text-sm">
                  No brands found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((brand: Brand) => (
                <TableRow key={brand.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground text-sm">{brand.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{brand.code}</div>
                  </TableCell>
                  <TableCell><StatusBadge active={brand.isActive} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(brand.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stores tab (Brand Isolation enforced by BE — FE just renders)
// ---------------------------------------------------------------------------
function StoresTab({ brands }: { brands: Brand[] }) {
  const { data: stores = [], isLoading, refetch } = useStores();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stores.filter((s: Store) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
      if (brandFilter !== "all" && s.brandId !== brandFilter) return false;
      if (typeFilter !== "all" && s.modelType !== typeFilter) return false;
      if (statusFilter !== "all" && String(s.isActive) !== statusFilter) return false;
      return true;
    });
  }, [stores, search, brandFilter, typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage stores, model types, and direct AM assignment.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" /> New Store
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={brandFilter} onValueChange={(v: string | null) => setBrandFilter(v ?? "all")}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="cloud_kitchen">Cloud Kitchen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide min-w-48">Store</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide min-w-28">Brand</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide min-w-28">Type</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide min-w-36">AM Assigned</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide min-w-36">Store Manager</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide w-28">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wide w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton cols={7} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10 text-sm">
                  No stores found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((store: Store) => (
                <TableRow key={store.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground text-sm">{store.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{store.code}</div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {store.brand?.name ?? "—"}
                  </TableCell>
                  <TableCell><ModelBadge type={store.modelType} /></TableCell>
                  <TableCell>
                    {store.am ? (
                      <div>
                        <div className="text-sm text-foreground">{store.am.fullName}</div>
                        <div className="text-xs text-muted-foreground">{store.am.email}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {store.manager ? (
                      <div>
                        <div className="text-sm text-foreground">{store.manager.fullName}</div>
                        <div className="text-xs text-muted-foreground">{store.manager.email}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge active={store.isActive} /></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} / {stores.length} stores
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function OrganizationPage() {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: stores = [], isLoading: storesLoading } = useStores();

  const activeStores = stores.filter((s: Store) => s.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands & Stores"
        subtitle="Configure brands, store model types, and direct Area Manager assignments."
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Total Brands" value={brandsLoading ? "—" : brands.length} />
        <Metric label="Active Brands" value={brandsLoading ? "—" : brands.filter((b: Brand) => b.isActive).length} />
        <Metric label="Total Stores" value={storesLoading ? "—" : stores.length} />
        <Metric label="Active Stores" value={storesLoading ? "—" : activeStores} />
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Organization Catalog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Brand isolation is enforced server-side — Standard stores are always single-brand.
          </p>
        </div>
        <div className="p-5">
          <Tabs defaultValue="brands">
            <TabsList className="mb-5">
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
            </TabsList>
            <TabsContent value="brands"><BrandsTab /></TabsContent>
            <TabsContent value="stores"><StoresTab brands={brands} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
