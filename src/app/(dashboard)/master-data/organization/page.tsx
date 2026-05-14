"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Download, Store as StoreIcon, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreDrawer } from "@/features/master-data/components/store-drawer";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { useBrands, useCreateBrand, useUpdateBrand } from "@/features/master-data/hooks/use-brands";
import { useStores, useCreateStore, useUpdateStore } from "@/features/master-data/hooks/use-stores";
import {
  PageHeader, StatusBadge, MetricCard, SearchInput, DataTable, RowActions, PaginationControls,
} from "@/shared/components";
import type { ColumnDef, RowAction } from "@/shared/components";
import type { Brand, Store, StoreModelType } from "@/shared/types";

type EditingItem = Brand | Store;

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("stores");
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [storeSearch, setStoreSearch] = useState("");
  const [storePage, setStorePage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const [brandId, setBrandId] = useState<string | undefined>(undefined);

  // Totals for MetricCards — populated from hook data (no extra API calls)
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => { setStorePage(1); }, [brandId]);

  const brands = useBrands({ page: brandPage, limit: 20 });
  const stores = useStores({ page: storePage, limit: 20, brandId });
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const storeRows = stores.data?.data ?? [];
  const storeMeta = stores.data?.meta;
  const brandRows = brands.data?.data ?? [];
  const brandMeta = brands.data?.meta;

  // Update MetricCard totals when data loads
  useEffect(() => {
    if (brandMeta?.total !== undefined) setTotalBrands(brandMeta.total);
  }, [brandMeta?.total]);

  useEffect(() => {
    if (storeMeta?.total !== undefined) setTotalStores(storeMeta.total);
  }, [storeMeta?.total]);

  const filteredStores = useMemo(() => {
    if (!storeSearch) return storeRows;
    const q = storeSearch.toLowerCase();
    return storeRows.filter((s) =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [storeRows, storeSearch]);

  const handleCreate = () => {
    setEditingItem(null);
    if (activeTab === "stores") setIsStoreDrawerOpen(true);
    if (activeTab === "brands") setIsBrandDrawerOpen(true);
  };

  const handleEdit = useCallback((item: EditingItem) => {
    setEditingItem(item);
    if ("brandId" in item) {
      setIsStoreDrawerOpen(true);
    } else {
      setIsBrandDrawerOpen(true);
    }
  }, []);

  const handleBrandSubmit = async (data: { name: string; code: string; status: string }) => {
    try {
      const payload: Partial<Brand> = {
        name: data.name,
        code: data.code,
        isActive: data.status === "active",
      };
      if (editingItem && "code" in editingItem && !("brandId" in editingItem)) {
        await updateBrand.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        await createBrand.mutateAsync(payload);
        toast.success("Tạo thương hiệu thành công");
      }
      setIsBrandDrawerOpen(false);
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleStoreSubmit = async (data: {
    code: string; name: string; brand: string; geo: string;
    type: string; province: string; district: string; ward: string;
    address: string; managerId: string; isActive: boolean;
  }) => {
    try {
      const storePayload: Partial<Store> = {
        code: data.code,
        name: data.name,
        brandId: data.brand,
        region: data.geo,
        modelType: data.type as StoreModelType,
        province: data.province,
        district: data.district,
        ward: data.ward,
        address: data.address,
        managerId: data.managerId,
        isActive: data.isActive,
      };
      if (!storePayload.brandId) {
        toast.error("Vui lòng chọn thương hiệu");
        return;
      }
      if (editingItem && "brandId" in editingItem) {
        await updateStore.mutateAsync({ id: editingItem.id, ...storePayload });
        toast.success("Cập nhật cửa hàng thành công");
      } else {
        await createStore.mutateAsync(storePayload);
        toast.success("Tạo cửa hàng thành công");
      }
      setIsStoreDrawerOpen(false);
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const storeInitialData = editingItem && "brandId" in editingItem
    ? {
        code: editingItem.code,
        name: editingItem.name,
        brand: editingItem.brandId ?? "",
        geo: editingItem.region ?? "",
        type: editingItem.modelType,
        province: editingItem.province ?? "",
        district: editingItem.district ?? "",
        ward: editingItem.ward ?? "",
        address: editingItem.address ?? "",
        managerId: editingItem.managerId ?? "",
        isActive: editingItem.isActive,
      }
    : undefined;

  const brandInitialData = editingItem && "isActive" in editingItem && !("brandId" in editingItem)
    ? {
        name: (editingItem as Brand).name,
        code: (editingItem as Brand).code,
        status: (editingItem as Brand).isActive ? "active" : "inactive",
      }
    : undefined;

  const storeColumns = useMemo((): ColumnDef<Store>[] => [
    {
      header: "Cửa hàng",
      cell: (s) => (
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <StoreIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            {s.name}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">Mã: {s.code}</div>
        </div>
      ),
    },
    {
      header: "Thương hiệu",
      cell: (s) => (
        <Badge variant="outline" className="font-medium text-xs">
          {s.brand?.name ?? "—"}
        </Badge>
      ),
      className: "w-32",
    },
    {
      header: "Khu vực",
      cell: (s) => <span className="text-sm text-muted-foreground">{s.region ?? "—"}</span>,
      className: "w-28",
      hideOnMobile: true,
    },
    {
      header: "AM phụ trách",
      hideOnMobile: true,
      cell: (s) => s.am ? (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {s.am.fullName.split(" ").pop()?.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-medium">{s.am.fullName}</span>
        </div>
      ) : <span className="text-xs text-muted-foreground">Chưa gán</span>,
      className: "w-40",
    },
    {
      header: "Trạng thái",
      cell: (s) => <StatusBadge status={s.isActive ? "active" : "inactive"} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (s) => {
        const actions: RowAction[] = [
          { label: "Sửa", icon: Edit2, onClick: () => handleEdit(s) },
          { label: "Xóa", icon: Trash2, onClick: () => {}, variant: "destructive" },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-36",
    },
  ], [handleEdit]);

  const brandColumns = useMemo((): ColumnDef<Brand>[] => [
    {
      header: "Thương hiệu",
      cell: (b) => (
        <div className="flex items-center gap-1.5 font-semibold">
          <Flag className="h-3.5 w-3.5 text-primary shrink-0" />
          {b.name}
        </div>
      ),
    },
    {
      header: "Mã",
      cell: (b) => <span className="font-mono text-sm">{b.code}</span>,
      className: "w-24",
    },
    {
      header: "Trạng thái",
      cell: (b) => <StatusBadge status={b.isActive ? "active" : "inactive"} />,
      className: "w-32",
    },
    {
      header: "",
      cell: (b) => {
        const actions: RowAction[] = [
          { label: "Sửa", icon: Edit2, onClick: () => handleEdit(b) },
        ];
        return <RowActions actions={actions} />;
      },
      className: "w-20",
    },
  ], [handleEdit]);


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Thương hiệu & Cửa hàng"
        subtitle="Cấu hình thương hiệu, loại hình cửa hàng và phân công Area Manager."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-sm">
            <Plus className="h-4 w-4" />
            {activeTab === "stores" ? "Thêm cửa hàng" : "Thêm thương hiệu"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Tổng thương hiệu" value={totalBrands || "—"} icon={Flag} />
        <MetricCard label="Tổng cửa hàng" value={totalStores || "—"} icon={StoreIcon} />
      </div>

      <Tabs defaultValue="stores" className="w-full" onValueChange={setActiveTab}>
        <div className="bg-white p-5 rounded-2xl shadow-md border space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-0">
            <TabsList className="bg-transparent h-14 p-0 gap-8">
              <TabsTrigger value="brands" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                Thương hiệu
              </TabsTrigger>
              <TabsTrigger value="stores" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                Danh sách cửa hàng
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stores" className="space-y-4 pt-2 m-0">
            <SearchInput
              value={storeSearch}
              onChange={setStoreSearch}
              placeholder="Tìm theo mã, tên hoặc địa chỉ..."
              className="max-w-md"
            />
            <DataTable<Store>
              columns={storeColumns}
              data={filteredStores}
              isLoading={stores.isLoading}
              emptyTitle="Chưa có cửa hàng nào"
              emptyDescription="Thêm cửa hàng đầu tiên để bắt đầu quản lý."
              footerContent={
                storeMeta && storeMeta.totalPages > 1 ? (
                  <PaginationControls page={storeMeta.page} totalPages={storeMeta.totalPages} total={storeMeta.total} onPageChange={setStorePage} />
                ) : storeSearch ? (
                  <p className="text-xs text-muted-foreground">Hiển thị {filteredStores.length} / {storeMeta?.total ?? storeRows.length} cửa hàng</p>
                ) : undefined
              }
            />
          </TabsContent>

          <TabsContent value="brands" className="space-y-4 pt-2 m-0">
            <DataTable<Brand>
              columns={brandColumns}
              data={brandRows}
              isLoading={brands.isLoading}
              emptyTitle="Chưa có thương hiệu nào"
              emptyDescription="Thêm thương hiệu đầu tiên để bắt đầu."
              footerContent={
                brandMeta && brandMeta.totalPages > 1 ? (
                  <PaginationControls page={brandMeta.page} totalPages={brandMeta.totalPages} total={brandMeta.total} onPageChange={setBrandPage} />
                ) : undefined
              }
            />
          </TabsContent>

        </div>
      </Tabs>

      <StoreDrawer
        open={isStoreDrawerOpen}
        onOpenChange={setIsStoreDrawerOpen}
        onSubmit={handleStoreSubmit}
        initialData={storeInitialData}
        brands={brandRows}
      />

      <BrandDrawer
        open={isBrandDrawerOpen}
        onOpenChange={setIsBrandDrawerOpen}
        onSubmit={handleBrandSubmit}
        initialData={brandInitialData}
      />

    </div>
  );
}
