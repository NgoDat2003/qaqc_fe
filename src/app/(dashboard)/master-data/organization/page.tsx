"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCw, Flag, CheckCircle2, Store as StoreIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useBrands, useStores } from "@/features/master-data";
import {
  PageHeader, StatusBadge, MetricCard, SearchInput, DataTable,
} from "@/shared/components";
import type { ColumnDef } from "@/shared/components";
import type { Brand, Store } from "@/shared/types";

// ---------------------------------------------------------------------------
// Domain-specific helpers (not in shared — store/org specific)
// ---------------------------------------------------------------------------

function ModelBadge({ type }: { type: string }) {
  return type === "cloud_kitchen" ? (
    <Badge className="bg-info-bg text-info border-info/20 text-xs font-medium">Cloud Kitchen</Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground text-xs font-medium">Standard</Badge>
  );
}

// ---------------------------------------------------------------------------
// Column definitions (defined outside components — no closures needed)
// ---------------------------------------------------------------------------

const brandColumns: ColumnDef<Brand>[] = [
  {
    header: "Thương hiệu",
    cell: (b) => (
      <div>
        <div className="font-semibold text-foreground">{b.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{b.code}</div>
      </div>
    ),
  },
  {
    header: "Trạng thái",
    cell: (b) => <StatusBadge status={b.isActive ? "active" : "inactive"} />,
    className: "w-32",
  },
  {
    header: "Cập nhật",
    cell: (b) => (
      <span className="text-xs text-muted-foreground">
        {new Date(b.updatedAt).toLocaleDateString("vi-VN")}
      </span>
    ),
    className: "w-32",
  },
  {
    header: "Thao tác",
    cell: () => <Button variant="outline" size="sm" className="h-7 text-xs">Sửa</Button>,
    className: "w-20",
  },
];

const storeColumns: ColumnDef<Store>[] = [
  {
    header: "Cửa hàng",
    cell: (s) => (
      <div>
        <div className="font-semibold text-foreground">{s.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
      </div>
    ),
  },
  {
    header: "Thương hiệu",
    cell: (s) => <span className="text-sm">{s.brand?.name ?? "—"}</span>,
    className: "min-w-28",
  },
  {
    header: "Loại hình",
    cell: (s) => <ModelBadge type={s.modelType} />,
    className: "min-w-28",
  },
  {
    header: "AM phụ trách",
    hideOnMobile: true,
    cell: (s) => s.am ? (
      <div>
        <div className="text-sm">{s.am.fullName}</div>
        <div className="text-xs text-muted-foreground">{s.am.email}</div>
      </div>
    ) : <span className="text-xs text-muted-foreground italic">Chưa gán</span>,
    className: "min-w-36",
  },
  {
    header: "Quản lý CH",
    hideOnMobile: true,
    cell: (s) => s.manager ? (
      <div>
        <div className="text-sm">{s.manager.fullName}</div>
        <div className="text-xs text-muted-foreground">{s.manager.email}</div>
      </div>
    ) : <span className="text-xs text-muted-foreground italic">Chưa gán</span>,
    className: "min-w-36",
  },
  {
    header: "Trạng thái",
    cell: (s) => <StatusBadge status={s.isActive ? "active" : "inactive"} />,
    className: "w-32",
  },
  {
    header: "Thao tác",
    cell: () => <Button variant="outline" size="sm" className="h-7 text-xs">Sửa</Button>,
    className: "w-20",
  },
];

// ---------------------------------------------------------------------------
// Brands tab
// ---------------------------------------------------------------------------
function BrandsTab() {
  const { data: brands = [], isLoading, refetch } = useBrands();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() =>
    brands.filter((b: Brand) => statusFilter === "all" || String(b.isActive) === statusFilter),
    [brands, statusFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Quản lý thương hiệu và trạng thái vận hành.
        </p>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" /> Thêm thương hiệu
          </Button>
        </div>
      </div>

      <DataTable<Brand>
        columns={brandColumns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="Chưa có thương hiệu"
        emptyDescription="Thêm thương hiệu đầu tiên để bắt đầu."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stores tab
// ---------------------------------------------------------------------------
function StoresTab({ brands }: { brands: Brand[] }) {
  const { data: stores = [], isLoading, refetch } = useStores();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (stores as Store[]).filter((s) => {
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
          Quản lý cửa hàng, loại hình và phân công AM.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" /> Thêm cửa hàng
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên hoặc mã..."
          className="flex-1 min-w-48"
        />
        <Select value={brandFilter} onValueChange={(v: string | null) => setBrandFilter(v ?? "all")}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Tất cả thương hiệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Loại hình" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="cloud_kitchen">Cloud Kitchen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Ngừng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<Store>
        columns={storeColumns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="Chưa có cửa hàng"
        emptyDescription="Thêm cửa hàng đầu tiên hoặc thay đổi bộ lọc."
        footerContent={
          <p className="text-xs text-muted-foreground">
            Hiển thị {filtered.length} / {stores.length} cửa hàng
          </p>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function OrganizationPage() {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: stores = [], isLoading: storesLoading } = useStores();

  const activeStores = (stores as Store[]).filter((s) => s.isActive).length;
  const activeBrands = (brands as Brand[]).filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thương hiệu & Cửa hàng"
        subtitle="Cấu hình thương hiệu, loại hình cửa hàng và phân công Area Manager."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Tổng thương hiệu"
          value={brandsLoading ? "—" : brands.length}
          icon={Flag}
        />
        <MetricCard
          label="Thương hiệu hoạt động"
          value={brandsLoading ? "—" : activeBrands}
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          label="Tổng cửa hàng"
          value={storesLoading ? "—" : stores.length}
          icon={StoreIcon}
        />
        <MetricCard
          label="Cửa hàng hoạt động"
          value={storesLoading ? "—" : activeStores}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Danh mục tổ chức</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Brand isolation được enforce ở server — Standard stores luôn thuộc một thương hiệu duy nhất.
          </p>
        </div>
        <div className="p-5">
          <Tabs defaultValue="brands">
            <TabsList className="mb-5">
              <TabsTrigger value="brands">Thương hiệu</TabsTrigger>
              <TabsTrigger value="stores">Cửa hàng</TabsTrigger>
            </TabsList>
            <TabsContent value="brands"><BrandsTab /></TabsContent>
            <TabsContent value="stores"><StoresTab brands={brands as Brand[]} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
