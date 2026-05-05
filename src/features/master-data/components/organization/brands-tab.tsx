"use client";

import { useState, useMemo } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BrandDrawer } from "@/features/master-data/components/brand-drawer";
import { StatusBadge } from "@/features/master-data/components/badges";
import { DataView, type ColumnDef } from "@/shared/components/data-view";
import { useBrands } from "@/features/master-data";
import type { Brand } from "@/shared/types";

// ---------------------------------------------------------------------------
// Configuration: Brands
// ---------------------------------------------------------------------------
const getBrandColumns = (onEdit: (brand: Brand) => void): ColumnDef<Brand>[] => [
  {
    header: "Thương hiệu",
    cell: (brand) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 text-sm">{brand.name}</span>
        <span className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">{brand.code}</span>
      </div>
    ),
  },
  {
    header: "Trạng thái",
    headerClassName: "w-32",
    cell: (brand) => <StatusBadge active={brand.isActive} />,
  },
  {
    header: "Cập nhật",
    headerClassName: "w-40",
    cell: (brand) => (
      <span className="text-xs text-gray-500">
        {new Date(brand.updatedAt).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
  {
    header: "Thao tác",
    headerClassName: "w-24 text-right",
    className: "text-right",
    cell: (brand) => (
      <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-lg text-xs"
        onClick={() => onEdit(brand)}
      >
        <Edit2 className="h-3 w-3 mr-1" /> Sửa
      </Button>
    ),
  },
];

export function BrandsTab() {
  const { data: brands = [], isLoading } = useBrands();
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const filtered = useMemo(() =>
    brands.filter(b => statusFilter === "all" || String(b.isActive) === statusFilter),
    [brands, statusFilter]
  );

  const handleCreate = () => {
    setEditingBrand(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsDrawerOpen(true);
  };

  const brandColumns = useMemo(() => getBrandColumns(handleEdit), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Danh mục thương hiệu</h3>
          <p className="text-xs text-gray-500">Quản lý định danh và thông tin cơ bản của các thương hiệu.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40 h-9 text-sm rounded-lg bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngưng hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} className="h-9 rounded-lg px-4 gap-1.5 text-sm font-medium">
            <Plus className="h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <DataView
        data={filtered}
        columns={brandColumns}
        isLoading={isLoading}
        keyExtractor={(b) => b.id}
        renderCard={(brand) => (
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{brand.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">{brand.code}</span>
              </div>
              <StatusBadge active={brand.isActive} />
            </div>
            <Button
              variant="outline"
              className="w-full h-9 rounded-lg text-sm"
              onClick={() => handleEdit(brand)}
            >
              <Edit2 className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa thương hiệu
            </Button>
          </div>
        )}
      />

      <BrandDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        brand={editingBrand || undefined}
        mode={editingBrand ? "edit" : "create"}
      />
    </div>
  );
}
