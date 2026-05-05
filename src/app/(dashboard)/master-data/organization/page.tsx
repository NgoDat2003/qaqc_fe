"use client";

import { RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Reusable Components
import { MetricCard } from "@/features/master-data/components/metric-card";

import { useBrands, useStores } from "@/features/master-data";
import { PageHeader } from "@/shared/components/page-header";
import type { Brand } from "@/shared/types";

import { BrandsTab } from "@/features/master-data/components/organization/brands-tab";
import { StoresTab } from "@/features/master-data/components/organization/stores-tab";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function OrganizationPage() {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: stores = [], isLoading: storesLoading } = useStores();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <PageHeader
        title="Quản lý hệ thống"
        subtitle="Quản lý danh sách thương hiệu, mô hình vận hành và cửa hàng trên toàn hệ thống."
      >
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 px-2 border-r border-gray-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hệ thống ổn định</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-gray-400 hover:text-gray-900">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </PageHeader>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Thương hiệu" value={brandsLoading ? "—" : brands.filter(b => b.isActive).length} />
        <MetricCard label="Tổng cửa hàng" value={storesLoading ? "—" : stores.length} tone="success" />
        <MetricCard label="Độ phủ AM" value="98.5%" tone="warning" />
        <MetricCard label="Tính toàn vẹn" value="92/100" />
      </div>

      {/* Main Tab Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs defaultValue="stores" className="w-full">
          <div className="px-5 pt-5 pb-0 border-b border-gray-50 flex items-center justify-between">
            <TabsList className="h-10 bg-transparent p-0 gap-6 border-none">
              <TabsTrigger 
                value="stores" 
                className="rounded-none border-b-2 border-transparent px-1 h-full font-semibold text-gray-500 data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 shadow-none"
              >
                Danh sách cửa hàng
              </TabsTrigger>
              <TabsTrigger 
                value="brands" 
                className="rounded-none border-b-2 border-transparent px-1 h-full font-semibold text-gray-500 data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 shadow-none"
              >
                Danh mục thương hiệu
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              <Info className="h-3 w-3" />
              Dữ liệu được cách ly theo brand
            </div>
          </div>

          <div className="p-5">
            <TabsContent value="brands" className="mt-0 outline-none"><BrandsTab /></TabsContent>
            <TabsContent value="stores" className="mt-0 outline-none"><StoresTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
