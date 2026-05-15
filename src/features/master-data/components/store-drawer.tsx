"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ComboboxInput } from "@/shared/components/combobox-input";
import { useBrands } from "../hooks/use-brands";
import { useUsersByRole } from "../hooks/use-users";
import { getProvinceOptions, getWardOptionsForProvince } from "../hooks/use-vn-address";
import { DRAWER_LABEL, DRAWER_INPUT, DRAWER_SELECT, DRAWER_SECTION_CLASS } from "@/shared/styles/drawer-form-styles";
import { MODEL_TYPE_LABELS } from "./store-drawer-constants";

const schema = z.object({
  code:      z.string().min(2, "Mã tối thiểu 2 ký tự"),
  name:      z.string().min(2, "Tên là bắt buộc"),
  brandId:   z.string().min(1, "Chọn thương hiệu"),
  modelType: z.enum(["standard", "cloud_kitchen"]),
  province:  z.string().optional(),
  ward:      z.string().optional(),
  // district removed — eliminated in 2025 VN administrative merger
  address:   z.string().optional(),
  amId:      z.string().optional(),
  managerId: z.string().optional(),
  isActive:  z.boolean(),
});

export type StoreFormValues = z.infer<typeof schema>;

const DEFAULTS: StoreFormValues = {
  code: "", name: "", brandId: "", modelType: "standard",
  province: "", ward: "", address: "",
  amId: "", managerId: "", isActive: true,
};

const PROVINCE_OPTIONS = getProvinceOptions();

export interface StoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StoreFormValues) => Promise<void>;
  initialData?: Partial<StoreFormValues>;
}

const LBL = DRAWER_LABEL;
const INP = DRAWER_INPUT;
const SEL = DRAWER_SELECT;

function Section({ label }: { label: string }) {
  return <div className={DRAWER_SECTION_CLASS}>{label}</div>;
}

export function StoreDrawer({ open, onOpenChange, onSubmit, initialData }: StoreDrawerProps) {
  const form = useForm<StoreFormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const modelType = form.watch("modelType");

  const [selectedProvince, setSelectedProvince] = useState("");
  const wardOptions = useMemo(() => getWardOptionsForProvince(selectedProvince), [selectedProvince]);

  const { data: brands = [] } = useBrands();
  const { data: ams = [] } = useUsersByRole("am", { enabled: open });
  const { data: managers = [] } = useUsersByRole("store_manager", { enabled: open });

  const filteredBrands = modelType === "cloud_kitchen"
    ? brands.filter((b) => b.code.toUpperCase() === "CLOUD")
    : brands.filter((b) => b.code.toUpperCase() !== "CLOUD");

  const brandOptions   = filteredBrands.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }));
  const amOptions      = ams.map((u) => ({ value: u.id, label: u.fullName }));
  const managerOptions = managers.map((u) => ({ value: u.id, label: u.fullName }));

  useEffect(() => {
    if (open) {
      form.reset(initialData ? { ...DEFAULTS, ...initialData } : DEFAULTS);
      setSelectedProvince(initialData?.province ?? "");
    }
  }, [open, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEdit = !!initialData?.code;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[640px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-muted/30 shrink-0">
          <SheetTitle className="text-lg font-bold">
            {isEdit ? "Cập nhật cửa hàng" : "Tạo cửa hàng mới"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Điền thông tin cửa hàng bên dưới.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">

                <Section label="Thông tin cơ bản" />

                {(["code", "name"] as const).map((f) => (
                  <FormField key={f} control={form.control} name={f} render={({ field }) => (
                    <FormItem>
                      <FormLabel className={LBL}>{f === "code" ? "Mã cửa hàng *" : "Tên cửa hàng *"}</FormLabel>
                      <FormControl>
                        <Input {...field} className={f === "code" ? `${INP} font-mono` : INP}
                          placeholder={f === "code" ? "mc-018" : "Maycha Vincom Thảo Điền"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}

                <FormField control={form.control} name="modelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LBL}>Loại cửa hàng *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className={SEL}><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(MODEL_TYPE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="brandId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LBL}>Thương hiệu *</FormLabel>
                    <ComboboxInput
                      options={brandOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn thương hiệu"
                      className={SEL}
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                <Section label="Địa chỉ" />

                {/* Province → Ward cascade (post-2025 merger: no district level) */}
                <FormField control={form.control} name="province" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LBL}>Tỉnh / Thành phố</FormLabel>
                    <ComboboxInput
                      options={PROVINCE_OPTIONS}
                      value={field.value || ""}
                      onChange={(v) => {
                        field.onChange(v);
                        setSelectedProvince(v);
                        form.setValue("ward", "");
                      }}
                      placeholder="Chọn tỉnh/thành"
                      className={SEL}
                    />
                  </FormItem>
                )} />

                <FormField control={form.control} name="ward" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LBL}>Phường / Xã</FormLabel>
                    <ComboboxInput
                      options={wardOptions}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder={selectedProvince ? "Chọn phường/xã" : "Chọn tỉnh/thành trước"}
                      disabled={!selectedProvince}
                      emptyText="Không tìm thấy phường/xã"
                      className={SEL}
                    />
                  </FormItem>
                )} />

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={LBL}>Địa chỉ chi tiết</FormLabel>
                    <FormControl><Input {...field} className={INP} placeholder="Số nhà, tên đường..." /></FormControl>
                  </FormItem>
                )} />

                <Section label="Phân công" />

                <FormField control={form.control} name="amId" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={LBL}>AM phụ trách</FormLabel>
                    <ComboboxInput
                      options={[{ value: "", label: "Chưa phân công" }, ...amOptions]}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Chọn Area Manager"
                      className={SEL}
                    />
                  </FormItem>
                )} />

                <FormField control={form.control} name="managerId" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={LBL}>Quản lý cửa hàng</FormLabel>
                    <ComboboxInput
                      options={[{ value: "", label: "Chưa phân công" }, ...managerOptions]}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Chọn Store Manager"
                      className={SEL}
                    />
                  </FormItem>
                )} />

                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center justify-between rounded-xl border p-4 bg-muted/20">
                    <div>
                      <FormLabel className="text-sm font-medium text-foreground">Trạng thái hoạt động</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Cửa hàng tham gia vào các đợt Audit</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 p-6 border-t bg-background flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg h-10 px-6" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" className="bg-primary rounded-lg h-10 min-w-[130px] font-semibold">
                {isEdit ? "Lưu thay đổi" : "Tạo cửa hàng"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
