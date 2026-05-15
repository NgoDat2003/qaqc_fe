"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Flag, Store as StoreIcon, XCircle, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { StoreDrawer, type StoreFormValues } from "@/features/master-data/components/store-drawer";
import { useBrands, useCreateBrand, useUpdateBrand } from "@/features/master-data/hooks/use-brands";
import { useStores, useCreateStore, useUpdateStore, useAssignAM } from "@/features/master-data/hooks/use-stores";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";
import { PageHeader, StatusBadge, MetricCard, SearchInput, SortableTable, RowActions, ComboboxInput } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { Brand, Store } from "@/shared/types";
import { MODEL_TYPE_LABELS } from "@/features/master-data/components/store-drawer-constants";

// Avatar circle with initials — color derived from brand code
function Avatar({ code }: { code: string }) {
  const palettes = ["bg-primary/20 text-primary", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700"];
  const color = palettes[code.charCodeAt(0) % palettes.length];
  return (
    <div className={`flex items-center justify-center rounded-lg font-bold text-xs ${color}`}
      style={{ width: 32, height: 32, minWidth: 32 }}>
      {code.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function OrganizationPage() {
  const [tab, setTab] = useState("brands");
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const [assignAMStore, setAssignAMStore] = useState<Store | null>(null);
  const [selectedAMId, setSelectedAMId] = useState("");

  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: ams = [] } = useUsersByRole("am", { enabled: !!assignAMStore });
  const amOptions = ams.map((u) => ({ value: u.id, label: u.fullName }));

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const assignAM = useAssignAM();

  // Client-side filter only — SortableTable handles sort + pagination internally
  const filteredBrands = useMemo(() => {
    const q = search.toLowerCase();
    return brands.filter((b) => !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
  }, [brands, search]);

  const filteredStores = useMemo(() => {
    const q = search.toLowerCase();
    return stores.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.province ?? "").toLowerCase().includes(q);
      return matchQ && (!brandFilter || s.brandId === brandFilter);
    });
  }, [stores, search, brandFilter]);

  // Metrics
  const activeStores = stores.filter((s) => s.isActive).length;
  const activeBrands = brands.filter((b) => b.isActive).length;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBrandSubmit = async (data: { name: string; code: string; status: string }) => {
    try {
      if (editingBrand) {
        // PATCH — BE does not accept code changes
        await updateBrand.mutateAsync({ id: editingBrand.id, name: data.name, isActive: data.status === "active" });
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        // POST — BE only accepts code + name (isActive defaults to true)
        await createBrand.mutateAsync({ code: data.code, name: data.name });
        toast.success("Tạo thương hiệu thành công");
      }
      setBrandDrawerOpen(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const handleStoreSubmit = async (data: StoreFormValues) => {
    try {
      const { isActive, ...createFields } = data;
      const patch = { ...data, amId: data.amId || null, managerId: data.managerId || null };
      const create = { ...createFields, amId: data.amId || undefined, managerId: data.managerId || undefined };
      if (editingStore) {
        await updateStore.mutateAsync({ id: editingStore.id, ...patch });
        toast.success("Cập nhật cửa hàng thành công");
      } else {
        // POST — BE does not accept isActive on create
        await createStore.mutateAsync(create);
        toast.success("Tạo cửa hàng thành công");
      }
      setStoreDrawerOpen(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  const openCreateStore = () => { setEditingStore(null); setStoreDrawerOpen(true); };
  const openCreateBrand = () => { setEditingBrand(null); setBrandDrawerOpen(true); };
  const openEditStore = useCallback((s: Store) => { setEditingStore(s); setStoreDrawerOpen(true); }, []);
  const openEditBrand = useCallback((b: Brand) => { setEditingBrand(b); setBrandDrawerOpen(true); }, []);

  const handleToggleBrand = useCallback(async (b: Brand) => {
    try {
      await updateBrand.mutateAsync({ id: b.id, isActive: !b.isActive });
      toast.success(b.isActive ? "Đã ngừng khai thác" : "Đã kích hoạt trở lại");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  }, [updateBrand]);

  const openAssignAM = useCallback((s: Store) => {
    setAssignAMStore(s);
    setSelectedAMId(s.amId ?? "");
  }, []);

  const handleConfirmAssignAM = async () => {
    if (!assignAMStore) return;
    try {
      await assignAM.mutateAsync({ id: assignAMStore.id, amId: selectedAMId || null });
      toast.success("Phân công AM thành công");
      setAssignAMStore(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  };

  // ── Column definitions ─────────────────────────────────────────────────────
  const brandColumns = useMemo((): SortableColumnDef<Brand>[] => [
    {
      header: "Thương hiệu",
      sortKey: "name",
      cell: (b) => (
        <div className="flex items-center gap-3">
          <Avatar code={b.code} />
          <div>
            <div className="font-semibold text-foreground">{b.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{b.code.toLowerCase()}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Số cửa hàng",
      sortKey: "_count" as keyof Brand,
      cell: (b) => (
        <span className="text-sm font-semibold text-foreground">
          {b._count?.stores ?? "—"}
        </span>
      ),
      className: "w-32",
    },
    { header: "Trạng thái", sortKey: "isActive", cell: (b) => <StatusBadge status={b.isActive ? "active" : "inactive"} />, className: "w-32" },
    {
      header: "",
      cell: (b) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEditBrand(b) },
          {
            label: b.isActive ? "Ngừng khai thác" : "Kích hoạt lại",
            icon: b.isActive ? XCircle : CheckCircle2,
            onClick: () => handleToggleBrand(b),
            variant: b.isActive ? "destructive" : "default",
          },
        ]} />
      ),
      className: "w-16",
    },
  ], [openEditBrand, handleToggleBrand]);

  const storeColumns = useMemo((): SortableColumnDef<Store>[] => [
    {
      header: "Cửa hàng",
      sortKey: "name",
      cell: (s) => (
        <div>
          <div className="font-semibold text-foreground">{s.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
        </div>
      ),
    },
    { header: "Loại", cell: (s) => <Badge variant="outline" className="text-xs">{MODEL_TYPE_LABELS[s.modelType] ?? s.modelType}</Badge>, className: "w-36" },
    { header: "AM phụ trách", cell: (s) => <span className="text-sm">{s.am?.fullName ?? <span className="text-muted-foreground text-xs">Chưa phân công</span>}</span>, className: "w-40", hideOnMobile: true },
    { header: "Tỉnh/Thành", sortKey: "province", cell: (s) => <span className="text-sm text-muted-foreground">{s.province ?? "—"}</span>, className: "w-36", hideOnMobile: true },
    { header: "Quản lý CH", cell: (s) => <span className="text-sm">{s.manager?.fullName ?? <span className="text-muted-foreground text-xs">Chưa gán</span>}</span>, className: "w-36", hideOnMobile: true },
    { header: "Trạng thái", sortKey: "isActive", cell: (s) => <StatusBadge status={s.isActive ? "active" : "inactive"} />, className: "w-28" },
    {
      header: "",
      cell: (s) => (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEditStore(s) },
          { label: "Phân công AM", icon: UserCheck, onClick: () => openAssignAM(s) },
        ]} />
      ),
      className: "w-16",
    },
  ], [openEditStore, openAssignAM]);

  const storeInitialData = editingStore ? {
    code: editingStore.code, name: editingStore.name,
    brandId: editingStore.brandId, modelType: editingStore.modelType,
    province: editingStore.province ?? "",
    ward: editingStore.ward ?? "", address: editingStore.address ?? "",
    amId: editingStore.amId ?? "", managerId: editingStore.managerId ?? "",
    isActive: editingStore.isActive,
  } : undefined;

  const brandInitialData = editingBrand
    ? { name: editingBrand.name, code: editingBrand.code, status: editingBrand.isActive ? "active" : "inactive" }
    : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Thương hiệu & Cửa hàng" subtitle="Quản lý thương hiệu, cửa hàng và phân công trong hệ thống.">
        <Button onClick={tab === "stores" ? openCreateStore : openCreateBrand} className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-sm">
          <Plus className="h-4 w-4" />
          {tab === "stores" ? "Thêm cửa hàng" : "Thêm thương hiệu"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Thương hiệu" value={brands.length} icon={Flag} />
        <MetricCard label="TH hoạt động" value={activeBrands} icon={Flag} />
        <MetricCard label="Cửa hàng" value={stores.length} icon={StoreIcon} />
        <MetricCard label="CH hoạt động" value={activeStores} icon={StoreIcon} />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(""); setBrandFilter(""); }}>
        <div className="bg-white p-5 rounded-2xl shadow-md border space-y-4">
          <div className="flex items-center justify-between border-b pb-0">
            <TabsList className="bg-transparent h-14 p-0 gap-8">
              {[["brands", "Thương hiệu"], ["stores", "Cửa hàng"]].map(([v, l]) => (
                <TabsTrigger key={v} value={v} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="stores" className="space-y-3 pt-1 m-0">
            <div className="flex gap-2">
              <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm theo mã, tên, tỉnh/thành..." className="max-w-sm" />
            </div>
            <SortableTable columns={storeColumns} data={filteredStores} isLoading={storesLoading}
              emptyTitle="Chưa có cửa hàng nào" emptyDescription="Nhấn Thêm cửa hàng để bắt đầu." />
          </TabsContent>

          <TabsContent value="brands" className="space-y-3 pt-1 m-0">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm theo mã hoặc tên..." className="max-w-sm" />
            <SortableTable columns={brandColumns} data={filteredBrands} isLoading={brandsLoading}
              emptyTitle="Chưa có thương hiệu nào" emptyDescription="Nhấn Thêm thương hiệu để bắt đầu." />
          </TabsContent>
        </div>
      </Tabs>

      <StoreDrawer open={storeDrawerOpen} onOpenChange={setStoreDrawerOpen} onSubmit={handleStoreSubmit} initialData={storeInitialData} />
      <BrandDrawer open={brandDrawerOpen} onOpenChange={setBrandDrawerOpen} onSubmit={handleBrandSubmit} initialData={brandInitialData} />

      {/* Assign AM Dialog */}
      <Dialog open={!!assignAMStore} onOpenChange={(o) => !o && setAssignAMStore(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Phân công Area Manager
            </DialogTitle>
            <DialogDescription>
              Cửa hàng: <strong>{assignAMStore?.name}</strong> ({assignAMStore?.code})
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <ComboboxInput
              options={[{ value: "", label: "Bỏ phân công AM" }, ...amOptions]}
              value={selectedAMId}
              onChange={setSelectedAMId}
              placeholder="Tìm và chọn Area Manager..."
              emptyText="Không tìm thấy AM"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignAMStore(null)}>Hủy</Button>
            <Button onClick={handleConfirmAssignAM} disabled={assignAM.isPending} className="bg-primary font-semibold">
              {assignAM.isPending ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
