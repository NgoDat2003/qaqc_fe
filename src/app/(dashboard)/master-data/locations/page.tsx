"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, MoreVertical, Filter, Download, Store as StoreIcon, Flag, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreDrawer } from "@/features/master-data/components/store-drawer";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { RegionDrawer } from "@/features/master-data/components/region-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrands, useCreateBrand, useUpdateBrand } from "@/features/master-data/hooks/use-brands";
import { useStores, useCreateStore, useUpdateStore } from "@/features/master-data/hooks/use-stores";
import type { Brand, Store, StoreModelType } from "@/shared/types";

type EditingItem = Brand | Store;

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j} className="py-5 px-6">
              <Skeleton className="h-4 w-full rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("stores");
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [isRegionDrawerOpen, setIsRegionDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const brands = useBrands();
  const stores = useStores();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const handleCreate = () => {
    setEditingItem(null);
    if (activeTab === "stores") setIsStoreDrawerOpen(true);
    if (activeTab === "brands") setIsBrandDrawerOpen(true);
    if (activeTab === "regions") setIsRegionDrawerOpen(true);
  };

  const handleEdit = (item: EditingItem) => {
    setEditingItem(item);
    if (activeTab === "stores") setIsStoreDrawerOpen(true);
    if (activeTab === "brands") setIsBrandDrawerOpen(true);
  };

  const handleBrandSubmit = async (data: { name: string; code: string; status: string }) => {
    try {
      const payload: Partial<Brand> = {
        name: data.name,
        code: data.code,
        isActive: data.status === "active",
      };
      if (editingItem && "code" in editingItem && !("storeId" in editingItem)) {
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
      const brandId = brands.data?.find((b) => b.name === data.brand)?.id ?? "";
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

  const isBrandPending = createBrand.isPending || updateBrand.isPending;
  const isStorePending = createStore.isPending || updateStore.isPending;

  const storeInitialData = editingItem && "brandId" in editingItem
    ? {
        code: editingItem.code,
        name: editingItem.name,
        brand: editingItem.brand?.name ?? "",
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
                <Plus className="h-4 w-4" /> {activeTab === "stores" ? "Thêm cửa hàng" : activeTab === "brands" ? "Thêm thương hiệu" : "Thêm khu vực"}
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
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Tìm theo mã, tên hoặc địa chỉ..." className="pl-10 h-11 bg-gray-50/50 focus:bg-white transition-all rounded-xl border-gray-100 shadow-sm" />
                    </div>
                    <Button variant="outline" className="gap-2 text-gray-600 rounded-xl font-bold h-11 border-gray-200">
                        <Filter className="h-4 w-4" /> Lọc nâng cao
                    </Button>
                </div>

                <div className="overflow-x-auto">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-w-[600px]">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5 px-6">Cửa hàng</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Thương hiệu</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Khu vực</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">AM phụ trách</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Trạng thái</TableHead>
                                <TableHead className="w-[100px] py-5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores.isLoading ? (
                              <TableSkeleton cols={6} />
                            ) : stores.data?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-400 py-12 font-bold">
                                  Chưa có cửa hàng nào
                                </TableCell>
                              </TableRow>
                            ) : (
                              stores.data?.map((store) => (
                                <TableRow key={store.id} className="hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-5 px-6">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                <StoreIcon className="h-3.5 w-3.5 text-primary" /> {store.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Mã định danh: {store.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant="outline" className="rounded-md font-black text-[9px] uppercase tracking-widest text-gray-600 bg-gray-50 border-gray-200">
                                            {store.brand?.name ?? "—"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-gray-600 text-sm">{store.region ?? "—"}</TableCell>
                                    <TableCell className="py-5">
                                        {store.am ? (
                                          <div className="flex items-center gap-2">
                                              <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                  {store.am.fullName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                                              </div>
                                              <span className="text-xs font-bold text-gray-700">{store.am.fullName}</span>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-gray-400">Chưa gán</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={`font-black uppercase text-[9px] tracking-widest rounded-md px-2 py-0.5 ${store.isActive ? "bg-emerald-500 hover:bg-emerald-500 shadow-sm text-white" : "bg-gray-100 text-gray-500"}`}>
                                            {store.isActive ? "Active" : "Locked"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white border-none shadow-none group">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            } />
                                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-gray-100 p-2">
                                                <DropdownMenuItem onClick={() => handleEdit(store)} className="gap-2 font-bold cursor-pointer rounded-lg">
                                                    <Edit2 className="h-4 w-4" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 font-bold text-red-600 focus:text-red-600 cursor-pointer rounded-lg">
                                                    <Trash2 className="h-4 w-4" /> Xóa cửa hàng
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
                </div>
            </TabsContent>

            {/* Brands tab */}
            <TabsContent value="brands" className="space-y-4 pt-2 m-0">
                <div className="overflow-x-auto">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-w-[600px]">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5 px-6">Thương hiệu</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Mã định danh</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Trạng thái</TableHead>
                                <TableHead className="w-[100px] py-5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.isLoading ? (
                              <TableSkeleton cols={4} />
                            ) : brands.data?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-400 py-12 font-bold">
                                  Chưa có thương hiệu nào
                                </TableCell>
                              </TableRow>
                            ) : (
                              brands.data?.map((brand) => (
                                <TableRow key={brand.id} className="hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-5 px-6">
                                        <span className="font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                            <Flag className="h-3.5 w-3.5 text-primary" /> {brand.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-gray-600">{brand.code}</TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={`font-black text-[9px] uppercase tracking-widest rounded-md ${brand.isActive ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                                            {brand.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-6">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(brand)} className="h-8 w-8 p-0 rounded-full hover:bg-white shadow-none border-none">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                              ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                </div>
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
      />

      <BrandDrawer
        open={isBrandDrawerOpen}
        onOpenChange={setIsBrandDrawerOpen}
        onSubmit={handleBrandSubmit}
        initialData={brandInitialData}
      />

      {/* RegionDrawer kept for future use — không mount khi tab regions chưa có API */}
    </div>
  );
}
