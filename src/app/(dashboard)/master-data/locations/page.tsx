"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Download, Store as StoreIcon, Flag, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreDrawer } from "@/features/master-data/components/store-drawer";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { RegionDrawer } from "@/features/master-data/components/region-drawer";
import { useBrands, useCreateBrand, useUpdateBrand } from "@/features/master-data/hooks/use-brands";
import { useStores, useCreateStore, useUpdateStore } from "@/features/master-data/hooks/use-stores";
import {
  StatusBadge, SearchInput, DataTable, RowActions,
} from "@/shared/components";
import type { ColumnDef, RowAction } from "@/shared/components";
import type { Brand, Store, StoreModelType } from "@/shared/types";

type EditingItem = Brand | Store;

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("stores");
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [isRegionDrawerOpen, setIsRegionDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [storeSearch, setStoreSearch] = useState("");

  const brands = useBrands();
  const stores = useStores();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const filteredStores = useMemo(() => {
    if (!storeSearch) return stores.data ?? [];
    const q = storeSearch.toLowerCase();
    return (stores.data ?? []).filter((s) =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [stores.data, storeSearch]);

  const handleCreate = () => {
    setEditingItem(null);
    if (activeTab === "stores") setIsStoreDrawerOpen(true);
    if (activeTab === "brands") setIsBrandDrawerOpen(true);
    if (activeTab === "regions") setIsRegionDrawerOpen(true);
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
      const brandId = data.brand;
      if (!brandId) {
        toast.error("Vui lòng chọn thương hiệu");
        return;
      }
      const payload: Partial<Store> = {
        code: data.code,
        name: data.name,
        brandId,
        region: data.geo,
        modelType: data.type as StoreModelType,
        province: data.province,
        district: data.district,
        ward: data.ward,
        address: data.address,
        managerId: data.managerId,
        isActive: data.isActive,
      };
      if (editingItem && "brandId" in editingItem) {
        await updateStore.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Cập nhật cửa hàng thành công");
      } else {
        await createStore.mutateAsync(payload);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Quản lý Thương hiệu & Cửa hàng</h1>
          <p className="text-sm text-gray-500 font-bold italic text-justify max-w-2xl leading-relaxed">
            Thiết lập kiến trúc hệ thống, quản trị đa thương hiệu và phân vùng giám sát cho Area Managers (AM).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl font-bold border-gray-200">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 gap-2 font-black shadow-lg shadow-primary/20 rounded-xl px-6 h-11">
            <Plus className="h-4 w-4" />
            {activeTab === "stores" ? "Thêm cửa hàng" : activeTab === "brands" ? "Thêm thương hiệu" : "Thêm khu vực"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stores" className="w-full" onValueChange={setActiveTab}>
        <div className="bg-white p-5 rounded-2xl shadow-md border space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-0">
            <TabsList className="bg-transparent h-14 p-0 gap-8">
              <TabsTrigger value="brands" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                Thương hiệu
              </TabsTrigger>
              <TabsTrigger value="regions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                Địa bàn / Khu vực
              </TabsTrigger>
              <TabsTrigger value="stores" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-black text-[11px] uppercase tracking-widest text-gray-400 data-[state=active]:text-primary transition-all">
                Danh sách cửa hàng
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Stores tab */}
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
                storeSearch && stores.data
                  ? <p className="text-xs text-muted-foreground">Hiển thị {filteredStores.length} / {stores.data.length} cửa hàng</p>
                  : undefined
              }
            />
          </TabsContent>

          {/* Brands tab */}
          <TabsContent value="brands" className="space-y-4 pt-2 m-0">
            <DataTable<Brand>
              columns={brandColumns}
              data={brands.data ?? []}
              isLoading={brands.isLoading}
              emptyTitle="Chưa có thương hiệu nào"
              emptyDescription="Thêm thương hiệu đầu tiên để bắt đầu."
            />
          </TabsContent>

          {/* Regions tab — API chưa có */}
          <TabsContent value="regions" className="pt-2 m-0">
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <MapPin className="h-10 w-10 text-gray-200" />
              <p className="font-black text-gray-400 text-sm uppercase tracking-widest">Tính năng đang phát triển</p>
              <p className="text-xs text-gray-300 max-w-xs">Quản lý địa bàn / khu vực sẽ được hỗ trợ trong phiên bản tiếp theo.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <StoreDrawer
        open={isStoreDrawerOpen}
        onOpenChange={setIsStoreDrawerOpen}
        onSubmit={handleStoreSubmit}
        initialData={storeInitialData}
        brands={brands.data ?? []}
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
