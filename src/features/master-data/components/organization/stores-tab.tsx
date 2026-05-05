"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StoreDrawer } from "@/features/master-data/components/store-drawer";
import { StatusBadge } from "@/features/master-data/components/badges";
import { DataView, type ColumnDef } from "@/shared/components/data-view";

import { useStores, useBrands, useUsers } from "@/features/master-data";
import type { Brand, Store } from "@/shared/types";

// ---------------------------------------------------------------------------
// Configuration: Stores
// ---------------------------------------------------------------------------
const getStoreColumns = (onEdit: (store: Store) => void): ColumnDef<Store>[] => [
  {
    header: "Cửa hàng",
    cell: (store) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 text-sm">{store.name}</span>
        <span className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">{store.code}</span>
      </div>
    ),
  },
  {
    header: "Loại hình",
    headerClassName: "w-32",
    cell: (store) => (
      <Badge variant="outline" className="text-[10px] bg-indigo-50/50 text-indigo-600 border-indigo-100 font-bold uppercase tracking-wider">
        {store.modelType === "cloud_kitchen" ? "Bếp trung tâm" : "Tiêu chuẩn"}
      </Badge>
    ),
  },
  {
    header: "Trạng thái",
    headerClassName: "w-32",
    cell: (store) => <StatusBadge active={store.isActive} />,
  },
  {
    header: "Quản lý (AM)",
    headerClassName: "w-40",
    cell: (store) => (
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-700">
          {store.am?.fullName || (store.amId === "unassigned" ? "Chưa gán" : "Chưa xác định")}
        </span>
        {store.am?.email && <span className="text-[10px] text-gray-400">{store.am.email}</span>}
      </div>
    ),
  },
  {
    header: "Thao tác",
    headerClassName: "w-24 text-right",
    className: "text-right",
    cell: (store) => (
      <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-lg text-xs"
        onClick={() => onEdit(store)}
      >
        <Edit2 className="h-3 w-3 mr-1" /> Sửa
      </Button>
    ),
  },
];

export function StoresTab() {
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const filtered = useMemo(() =>
    stores.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brandFilter === "all" || s.brandId === brandFilter;
      return matchSearch && matchBrand;
    }),
    [stores, search, brandFilter]
  );

  const handleCreate = () => {
    setEditingStore(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setIsDrawerOpen(true);
  };

  const storeColumns = useMemo(() => getStoreColumns(handleEdit), []);

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Danh sách cửa hàng</h3>
          <p className="text-xs text-gray-500">Quản lý chi tiết vận hành và gán quản lý cho từng chi nhánh.</p>
        </div>
        <Button onClick={handleCreate} className="h-9 rounded-lg px-4 gap-1.5 text-sm font-medium">
          <Plus className="h-4 w-4" /> Đăng ký cửa hàng
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc mã cửa hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg bg-white text-sm border-gray-100"
          />
        </div>
        <Select value={brandFilter} onValueChange={(v: string | null) => setBrandFilter(v ?? "all")}>
          <SelectTrigger className="w-48 h-9 text-sm rounded-lg bg-white border-gray-100">
            <SelectValue placeholder="Tất cả thương hiệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataView
        data={filtered}
        columns={storeColumns}
        isLoading={storesLoading || brandsLoading || usersLoading}
        keyExtractor={(s) => s.id}
        renderCard={(store) => (
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-[15px]">{store.name}</span>
                <span className="text-[10px] text-gray-400 font-mono tracking-wider">{store.code}</span>
              </div>
              <StatusBadge active={store.isActive} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.1em] mb-1">Thương hiệu</p>
                <p className="text-[11px] font-bold text-indigo-600 truncate">
                  {store.brand?.name || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.1em] mb-1">Quản lý (AM)</p>
                <p className="text-[11px] font-bold text-gray-700 truncate">
                  {store.am?.fullName || "Chưa gán"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 rounded-xl text-sm font-semibold border-gray-100 hover:bg-gray-50 gap-2 transition-all"
              onClick={() => handleEdit(store)}
            >
              <Edit2 className="h-3.5 w-3.5 text-gray-400" /> Chỉnh sửa cấu hình
            </Button>
          </div>
        )}
        emptyState={(
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <LayoutGrid className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-sm font-medium">Không tìm thấy cửa hàng phù hợp</p>
          </div>
        )}
      />

      <StoreDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        store={editingStore || undefined}
        brands={brands}
        users={users}
        mode={editingStore ? "edit" : "create"}
      />
    </div>
  );
}
