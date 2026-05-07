"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, Filter, Download, Store as StoreIcon, Flag, MapPin } from "lucide-react";
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
import { StoreDrawer } from "@/components/master-data/store-drawer";
import { BrandDrawer } from "@/components/master-data/brand-drawer";
import { RegionDrawer } from "@/components/master-data/region-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STORES_MOCK = [
  { id: "1", code: "mc-018", name: "Maycha Vincom Thảo Điền", brand: "Maycha", geo: "HCM - Phía Đông", manager: "Nguyễn Văn A", status: "active" },
  { id: "2", code: "mc-025", name: "Maycha Phan Xích Long", brand: "Maycha", geo: "HCM - Phía Tây", manager: "Trần Thị B", status: "active" },
  { id: "3", code: "tch-001", name: "The Coffee House Lê Văn Sỹ", brand: "TCH", geo: "HCM - Phía Tây", manager: "Lê Văn C", status: "active" },
  { id: "4", code: "mc-042", name: "Maycha Trần Hưng Đạo", brand: "Maycha", geo: "HCM - Trung Tâm", manager: "Phạm Văn D", status: "inactive" },
];

const BRANDS_MOCK = [
  { id: "1", name: "Maycha", code: "MC", storeCount: 85, status: "active" },
  { id: "2", name: "The Coffee House", code: "TCH", storeCount: 120, status: "active" },
  { id: "3", name: "Thịnh Thế", code: "TT", storeCount: 12, status: "active" },
];

const REGIONS_MOCK = [
  { id: "1", name: "HCM - Phía Đông", manager: "Nguyễn Văn A", storeCount: 25, status: "active" },
  { id: "2", name: "HCM - Phía Tây", manager: "Trần Thị B", storeCount: 30, status: "active" },
  { id: "3", name: "Bình Dương", manager: "Lê Văn C", storeCount: 15, status: "active" },
];

type EditingItem =
  | typeof STORES_MOCK[number]
  | typeof BRANDS_MOCK[number]
  | typeof REGIONS_MOCK[number];

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("stores");
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [isRegionDrawerOpen, setIsRegionDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

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
    if (activeTab === "regions") setIsRegionDrawerOpen(true);
  };

  const handleSubmit = (data: unknown) => {
    console.log("Submit data:", data);
    setIsStoreDrawerOpen(false);
    setIsBrandDrawerOpen(false);
    setIsRegionDrawerOpen(false);
  };

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

                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
                            {STORES_MOCK.map((store) => (
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
                                            {store.brand}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-gray-600 text-sm">{store.geo}</TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                {store.manager.split(' ').pop()?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{store.manager}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant={store.status === "active" ? "default" : "secondary"} className={`font-black uppercase text-[9px] tracking-widest rounded-md px-2 py-0.5 ${store.status === "active" ? "bg-emerald-500 hover:bg-emerald-500 shadow-sm" : ""}`}>
                                            {store.status === "active" ? "Active" : "Locked"}
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
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>

            <TabsContent value="brands" className="space-y-4 pt-2 m-0">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5 px-6">Thương hiệu</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Mã định danh</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Số lượng cửa hàng</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Trạng thái</TableHead>
                                <TableHead className="w-[100px] py-5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {BRANDS_MOCK.map((brand) => (
                                <TableRow key={brand.id} className="hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-5 px-6">
                                        <span className="font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                            <Flag className="h-3.5 w-3.5 text-primary" /> {brand.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-gray-600">{brand.code}</TableCell>
                                    <TableCell className="py-5">
                                        <Badge className="bg-gray-100 text-gray-700 font-black rounded-lg border-none shadow-none">{brand.storeCount} cửa hàng</Badge>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-md">Active</Badge>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-6">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(brand)} className="h-8 w-8 p-0 rounded-full hover:bg-white shadow-none border-none">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>

            <TabsContent value="regions" className="space-y-4 pt-2 m-0">
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5 px-6">Khu vực / Địa bàn</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">AM phụ trách</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Quy mô</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-900 py-5">Trạng thái</TableHead>
                                <TableHead className="w-[100px] py-5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {REGIONS_MOCK.map((region) => (
                                <TableRow key={region.id} className="hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-5 px-6">
                                        <span className="font-black text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-primary" /> {region.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                {region.manager.split(' ').pop()?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{region.manager}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm font-bold text-gray-600">{region.storeCount} cửa hàng</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-md">Active</Badge>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-6">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(region)} className="h-8 w-8 p-0 rounded-full hover:bg-white shadow-none border-none">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
        </div>
      </Tabs>

      <StoreDrawer 
        open={isStoreDrawerOpen} 
        onOpenChange={setIsStoreDrawerOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />

      <BrandDrawer
        open={isBrandDrawerOpen}
        onOpenChange={setIsBrandDrawerOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />

      <RegionDrawer
        open={isRegionDrawerOpen}
        onOpenChange={setIsRegionDrawerOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
}
