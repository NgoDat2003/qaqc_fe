"use client";

import { Layers, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SideDrawer, DrawerSection, DrawerInfoBox } from "@/shared/components/side-drawer";
import type { Brand } from "@/shared/types";

interface BrandDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand;
  mode?: "create" | "edit";
}

export function BrandDrawer({ open, onOpenChange, brand, mode = "create" }: BrandDrawerProps) {
  const isEdit = mode === "edit";

  const footer = (
    <>
      <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6 text-gray-500 hover:bg-gray-100">
        Hủy bỏ
      </Button>
      <Button className="bg-gray-900 hover:bg-gray-800 min-w-[180px] rounded-xl font-bold h-11 shadow-lg shadow-gray-100 gap-2 transition-all active:scale-95">
        <CheckCircle2 className="h-4 w-4" />
        {isEdit ? "Cập nhật thương hiệu" : "Tạo thương hiệu"}
      </Button>
    </>
  );

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Cấu hình thương hiệu" : "Khởi tạo thương hiệu mới"}
      description="Định nghĩa danh mục thương hiệu để phân cấp quản lý và tiêu chuẩn kiểm tra."
      icon={<Layers className="h-7 w-7" />}
      footer={footer}
      width="480px"
    >
      <div className="space-y-10">
        <DrawerInfoBox>
          Thông tin thương hiệu sẽ được dùng để phân loại cửa hàng và áp dụng các bộ tiêu chuẩn kiểm tra riêng biệt.
        </DrawerInfoBox>

        <DrawerSection title="Định danh thương hiệu" icon={Info}>
          <div className="grid gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="b-name" className="text-[13px] font-semibold text-gray-700 ml-1">
                Tên thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="b-name"
                defaultValue={brand?.name}
                placeholder="VD: MayCha Premium"
                className="h-12 rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="b-code" className="text-[13px] font-semibold text-gray-700">
                  Mã hệ thống <span className="text-red-500">*</span>
                </Label>
                {isEdit && <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-400 border-none font-black px-2 py-0 uppercase">Locked</Badge>}
              </div>
              <Input
                id="b-code"
                defaultValue={brand?.code}
                placeholder="VD: MAYCHA_PRO"
                className="h-12 rounded-xl border-gray-200 bg-gray-50/30 font-bold shadow-sm disabled:opacity-100 disabled:text-gray-400 transition-all text-sm"
                disabled={isEdit}
              />
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Trạng thái vận hành">
          <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-gray-900">Kích hoạt hoạt động</Label>
              <p className="text-xs font-medium text-gray-500 leading-none">Cho phép kiểm tra và gán cửa hàng vào thương hiệu này.</p>
            </div>
            <Switch defaultChecked={brand ? brand.isActive : true} />
          </div>
        </DrawerSection>
      </div>
    </SideDrawer>
  );
}
