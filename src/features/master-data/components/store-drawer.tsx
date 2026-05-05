"use client";

import { Store as StoreIcon, Info, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SideDrawer, DrawerSection, DrawerInfoBox } from "@/shared/components/side-drawer";
import type { Brand, Store, User } from "@/shared/types";

interface StoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store;
  brands: Brand[];
  users: User[];
  mode?: "create" | "edit";
}

export function StoreDrawer({ open, onOpenChange, store, brands, users, mode = "create" }: StoreDrawerProps) {
  const isEdit = mode === "edit";

  const footer = (
    <>
      <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6 text-gray-500 hover:bg-gray-100">
        Hủy bỏ
      </Button>
      <Button className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px] rounded-xl font-bold h-11 shadow-lg shadow-indigo-100 gap-2 transition-all active:scale-95">
        <CheckCircle2 className="h-4 w-4" />
        {isEdit ? "Cập nhật cửa hàng" : "Hoàn tất đăng ký"}
      </Button>
    </>
  );
  console.log(store);

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Cấu hình chi tiết cửa hàng" : "Đăng ký cửa hàng mới"}
      description="Quản lý định danh, mô hình vận hành và gán quản lý trực thuộc."
      icon={<StoreIcon className="h-7 w-7" />}
      footer={footer}
      width="500px"
    >
      <div className="space-y-10">
        <DrawerInfoBox>
          Lưu ý: Mã cửa hàng là định danh duy nhất của đơn vị trên hệ thống và không thể thay đổi sau khi tạo.
        </DrawerInfoBox>

        {/* Section 1: Core Identifiers */}
        <DrawerSection title="Thông tin định danh" icon={Info}>
          <div className="grid gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="s-name" className="text-[13px] font-semibold text-gray-700 ml-1">Tên cửa hàng <span className="text-red-500">*</span></Label>
              <Input
                id="s-name"
                defaultValue={store?.name}
                placeholder="VD: MayCha Quận 1"
                className="h-12 rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="s-code" className="text-[13px] font-semibold text-gray-700">Mã cửa hàng <span className="text-red-500">*</span></Label>
                  {isEdit && <Badge variant="outline" className="text-[9px] bg-gray-50 border-gray-200 text-gray-400 font-bold px-1.5 py-0 uppercase">Read Only</Badge>}
                </div>
                <Input
                  id="s-code"
                  defaultValue={store?.code}
                  disabled={isEdit}
                  placeholder="ST_0001"
                  className="h-12 rounded-xl border-gray-200 bg-gray-50/30 font-medium shadow-sm disabled:opacity-100 disabled:text-gray-400 transition-all text-sm"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[13px] font-semibold text-gray-700 ml-1">Thương hiệu trực thuộc <span className="text-red-500">*</span></Label>
                <Select defaultValue={store?.name}>
                  <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm">
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.name} className="font-medium">{b.name}</SelectItem>)}
                    {brands.length === 0 && <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DrawerSection>

        {/* Section 2: Operational Logic */}
        <DrawerSection title="Vận hành & Quản lý" icon={ShieldCheck}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label className="text-[13px] font-semibold text-gray-700 ml-1">Mô hình vận hành</Label>
              <Select defaultValue={store?.modelType || "standard"}>
                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard" className="font-medium">Cửa hàng tiêu chuẩn</SelectItem>
                  <SelectItem value="cloud_kitchen" className="font-medium">Bếp trung tâm (Cloud Kitchen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[13px] font-semibold text-gray-700 ml-1">Area Manager (AM)</Label>
              <Select defaultValue={store?.am?.fullName || "unassigned"}>
                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm">
                  <SelectValue placeholder="Gán quản lý" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="font-medium italic text-gray-400">Chưa gán quản lý</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.fullName} className="font-medium">
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-gray-900">Trạng thái kinh doanh</Label>
                <p className="text-xs font-medium text-gray-500 leading-none">Cửa hàng sẽ hiển thị trong báo cáo và lịch kiểm tra.</p>
              </div>
              <Switch defaultChecked={store ? store.isActive : true} />
            </div>
          </div>
        </DrawerSection>

        {/* Section 3: Location (Future) */}
        <DrawerSection title="Địa chỉ & Liên hệ" icon={MapPin}>
          <div className="p-8 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <MapPin className="h-6 w-6 mb-2 opacity-30" />
            <p className="text-[11px] font-bold uppercase tracking-widest">Đang cập nhật tính năng địa lý</p>
          </div>
        </DrawerSection>
      </div>
    </SideDrawer>
  );
}
