"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Edit2, Flag, Plus, Store as StoreIcon, UserCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { StoreDrawer, type StoreFormValues } from "@/features/master-data/components/store-drawer";
import { MODEL_TYPE_LABELS } from "@/features/master-data/components/store-drawer-constants";
import { useBrands, useCreateBrand, useUpdateBrand } from "@/features/master-data/hooks/use-brands";
import { useAssignAM, useCreateStore, useStores, useUpdateStore } from "@/features/master-data/hooks/use-stores";
import { useUsersByRole } from "@/features/master-data/hooks/use-users";
import { ComboboxInput, MetricCard, PageHeader, RowActions, SortableTable, StatusBadge } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { Brand, Store } from "@/shared/types";
import { useHasRole } from "@/lib/roles";

function Avatar({ code }: { code: string }) {
  const palettes = [
    "bg-primary-light text-primary",
    "bg-info-bg text-info",
    "bg-success-bg text-success",
    "bg-warning-bg text-warning",
    "bg-muted text-muted-foreground",
  ];
  const color = palettes[code.charCodeAt(0) % palettes.length];
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${color}`}>
      {code.slice(0, 2).toUpperCase()}
    </div>
  );
}

const STATUS_FILTERS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Ngưng" },
];

const MODEL_FILTERS = Object.entries(MODEL_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function OrganizationPage() {
  const isAdmin = useHasRole(["company_admin"]);
  const [tab, setTab] = useState("brands");
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [assignAMStore, setAssignAMStore] = useState<Store | null>(null);
  const [selectedAMId, setSelectedAMId] = useState("");

  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: ams = [] } = useUsersByRole("am", { enabled: !!assignAMStore });
  const amOptions = ams.map((user) => ({ value: user.id, label: user.fullName }));

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const assignAM = useAssignAM();

  const activeStores = stores.filter((store) => store.isActive).length;
  const activeBrands = brands.filter((brand) => brand.isActive).length;

  const handleBrandSubmit = async (data: { name: string; code: string; status: string }) => {
    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({ id: editingBrand.id, name: data.name, isActive: data.status === "active" });
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        await createBrand.mutateAsync({ code: data.code, name: data.name });
        toast.success("Tạo thương hiệu thành công");
      }
      setBrandDrawerOpen(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const handleStoreSubmit = async (data: StoreFormValues) => {
    try {
      const { isActive: _omitIsActive, ...createFields } = data;
      void _omitIsActive;
      const patch = { ...data, amId: data.amId || null, managerId: data.managerId || null };
      const create = { ...createFields, amId: data.amId || undefined, managerId: data.managerId || undefined };
      if (editingStore) {
        await updateStore.mutateAsync({ id: editingStore.id, ...patch });
        toast.success("Cập nhật cửa hàng thành công");
      } else {
        await createStore.mutateAsync(create);
        toast.success("Tạo cửa hàng thành công");
      }
      setStoreDrawerOpen(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const openCreateStore = () => {
    setEditingStore(null);
    setStoreDrawerOpen(true);
  };
  const openCreateBrand = () => {
    setEditingBrand(null);
    setBrandDrawerOpen(true);
  };
  const openEditStore = useCallback((store: Store) => {
    setEditingStore(store);
    setStoreDrawerOpen(true);
  }, []);
  const openEditBrand = useCallback((brand: Brand) => {
    setEditingBrand(brand);
    setBrandDrawerOpen(true);
  }, []);

  const handleToggleBrand = useCallback(async (brand: Brand) => {
    try {
      await updateBrand.mutateAsync({ id: brand.id, isActive: !brand.isActive });
      toast.success(brand.isActive ? "Đã ngưng khai thác" : "Đã kích hoạt trở lại");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  }, [updateBrand]);

  const openAssignAM = useCallback((store: Store) => {
    setAssignAMStore(store);
    setSelectedAMId(store.amId ?? "");
  }, []);

  const handleConfirmAssignAM = async () => {
    if (!assignAMStore) return;
    try {
      await assignAM.mutateAsync({ id: assignAMStore.id, amId: selectedAMId || null });
      toast.success("Phân công AM thành công");
      setAssignAMStore(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const brandColumns = useMemo((): SortableColumnDef<Brand>[] => [
    {
      header: "Thương hiệu",
      getSearchValue: (brand) => `${brand.name} ${brand.code}`,
      cell: (brand) => (
        <div className="flex items-center gap-3">
          <Avatar code={brand.code} />
          <div>
            <div className="font-semibold text-foreground">{brand.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{brand.code.toLowerCase()}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Số cửa hàng",
      getSortValue: (brand) => brand._count?.stores ?? 0,
      cell: (brand) => <span className="text-sm font-semibold text-foreground">{brand._count?.stores ?? "—"}</span>,
      className: "w-32",
    },
    {
      header: "Trạng thái",
      filterKey: "isActive",
      filterOptions: STATUS_FILTERS,
      cell: (brand) => <StatusBadge status={brand.isActive ? "active" : "inactive"} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (brand) => isAdmin ? (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEditBrand(brand) },
          {
            label: brand.isActive ? "Ngưng khai thác" : "Kích hoạt lại",
            icon: brand.isActive ? XCircle : CheckCircle2,
            onClick: () => handleToggleBrand(brand),
            variant: brand.isActive ? "destructive" : "default",
          },
        ]} />
      ) : null,
      className: "w-16",
    },
  ], [handleToggleBrand, isAdmin, openEditBrand]);

  const storeColumns = useMemo((): SortableColumnDef<Store>[] => [
    {
      header: "Cửa hàng",
      getSearchValue: (store) => `${store.name} ${store.code}`,
      cell: (store) => (
        <div>
          <div className="font-semibold text-foreground">{store.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{store.code}</div>
        </div>
      ),
    },
    {
      header: "Loại",
      filterKey: "modelType",
      filterOptions: MODEL_FILTERS,
      cell: (store) => <Badge variant="outline" className="text-xs">{MODEL_TYPE_LABELS[store.modelType] ?? store.modelType}</Badge>,
      className: "w-36",
    },
    {
      header: "AM phụ trách",
      hideOnMobile: true,
      getSearchValue: (store) => store.am?.fullName ?? "",
      cell: (store) => <span className="text-sm">{store.am?.fullName ?? <span className="text-xs text-muted-foreground">Chưa phân công</span>}</span>,
      className: "w-40",
    },
    {
      header: "Tỉnh/Thành",
      hideOnMobile: true,
      getSearchValue: (store) => store.province ?? "",
      cell: (store) => <span className="text-sm text-muted-foreground">{store.province ?? "—"}</span>,
      className: "w-36",
    },
    {
      header: "Quản lý CH",
      hideOnMobile: true,
      getSearchValue: (store) => store.manager?.fullName ?? "",
      cell: (store) => <span className="text-sm">{store.manager?.fullName ?? <span className="text-xs text-muted-foreground">Chưa gán</span>}</span>,
      className: "w-36",
    },
    {
      header: "Trạng thái",
      filterKey: "isActive",
      filterOptions: STATUS_FILTERS,
      cell: (store) => <StatusBadge status={store.isActive ? "active" : "inactive"} />,
      className: "w-28",
    },
    {
      header: "",
      cell: (store) => isAdmin ? (
        <RowActions actions={[
          { label: "Sửa", icon: Edit2, onClick: () => openEditStore(store) },
          { label: "Phân công AM", icon: UserCheck, onClick: () => openAssignAM(store) },
        ]} />
      ) : null,
      className: "w-16",
    },
  ], [isAdmin, openAssignAM, openEditStore]);

  const storeInitialData = editingStore ? {
    code: editingStore.code,
    name: editingStore.name,
    brandId: editingStore.brandId,
    modelType: editingStore.modelType,
    province: editingStore.province ?? "",
    ward: editingStore.ward ?? "",
    address: editingStore.address ?? "",
    amId: editingStore.amId ?? "",
    managerId: editingStore.managerId ?? "",
    isActive: editingStore.isActive,
  } : undefined;

  const brandInitialData = editingBrand
    ? { name: editingBrand.name, code: editingBrand.code, status: editingBrand.isActive ? "active" : "inactive" }
    : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Thương hiệu & Cửa hàng" subtitle="Quản lý thương hiệu, cửa hàng và phân công trong hệ thống.">
        {isAdmin && (
          <Button onClick={tab === "stores" ? openCreateStore : openCreateBrand} className="gap-2 bg-primary font-bold shadow-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {tab === "stores" ? "Thêm cửa hàng" : "Thêm thương hiệu"}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Thương hiệu" value={brands.length} icon={Flag} />
        <MetricCard label="TH hoạt động" value={activeBrands} icon={Flag} />
        <MetricCard label="Cửa hàng" value={stores.length} icon={StoreIcon} />
        <MetricCard label="CH hoạt động" value={activeStores} icon={StoreIcon} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-0">
            <TabsList className="h-14 gap-8 bg-transparent p-0">
              {[["brands", "Thương hiệu"], ["stores", "Cửa hàng"]].map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-full rounded-none border-b-2 border-transparent px-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="stores" className="m-0 pt-1">
            <SortableTable
              columns={storeColumns}
              data={stores}
              isLoading={storesLoading}
              mobileCard={{
                title: (store) => store.name,
                subtitle: (store) => store.code,
                badges: (store) => [
                  <Badge key="model" variant="outline" className="text-xs">{MODEL_TYPE_LABELS[store.modelType] ?? store.modelType}</Badge>,
                  <StatusBadge key="status" status={store.isActive ? "active" : "inactive"} />,
                ],
                details: [
                  { label: "AM phụ trách", value: (store) => store.am?.fullName ?? "Chưa phân công" },
                  { label: "Tỉnh/Thành", value: (store) => store.province ?? "—" },
                  { label: "Quản lý CH", value: (store) => store.manager?.fullName ?? "Chưa gán" },
                ],
                actions: (store) => isAdmin ? (
                  <RowActions actions={[
                    { label: "Sửa", icon: Edit2, onClick: () => openEditStore(store) },
                    { label: "Phân công AM", icon: UserCheck, onClick: () => openAssignAM(store) },
                  ]} />
                ) : null,
              }}
              emptyTitle="Chưa có cửa hàng nào"
              emptyDescription="Nhấn Thêm cửa hàng để bắt đầu."
            />
          </TabsContent>

          <TabsContent value="brands" className="m-0 pt-1">
            <SortableTable
              columns={brandColumns}
              data={brands}
              isLoading={brandsLoading}
              mobileCard={{
                leading: (brand) => <Avatar code={brand.code} />,
                title: (brand) => brand.name,
                subtitle: (brand) => brand.code.toLowerCase(),
                badges: (brand) => [
                  <StatusBadge key="status" status={brand.isActive ? "active" : "inactive"} />,
                ],
                metrics: [
                  { label: "Số cửa hàng", value: (brand) => brand._count?.stores ?? "—" },
                ],
                actions: (brand) => isAdmin ? (
                  <RowActions actions={[
                    { label: "Sửa", icon: Edit2, onClick: () => openEditBrand(brand) },
                    {
                      label: brand.isActive ? "Ngưng khai thác" : "Kích hoạt lại",
                      icon: brand.isActive ? XCircle : CheckCircle2,
                      onClick: () => handleToggleBrand(brand),
                      variant: brand.isActive ? "destructive" : "default",
                    },
                  ]} />
                ) : null,
              }}
              emptyTitle="Chưa có thương hiệu nào"
              emptyDescription="Nhấn Thêm thương hiệu để bắt đầu."
            />
          </TabsContent>
        </div>
      </Tabs>

      <StoreDrawer open={storeDrawerOpen} onOpenChange={setStoreDrawerOpen} onSubmit={handleStoreSubmit} initialData={storeInitialData} />
      <BrandDrawer open={brandDrawerOpen} onOpenChange={setBrandDrawerOpen} onSubmit={handleBrandSubmit} initialData={brandInitialData} />

      <Dialog open={!!assignAMStore} onOpenChange={(open) => !open && setAssignAMStore(null)}>
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
