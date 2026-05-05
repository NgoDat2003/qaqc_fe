"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  code: z.string().min(1, "Mã cửa hàng là bắt buộc"),
  name: z.string().min(1, "Tên cửa hàng là bắt buộc"),
  brand: z.string().min(1, "Thương hiệu là bắt buộc"),
  geo: z.string().min(1, "Khu vực là bắt buộc"),
  type: z.string().min(1, "Loại cửa hàng là bắt buộc"),
  province: z.string().min(1, "Tỉnh/Thành là bắt buộc"),
  district: z.string().min(1, "Quận/Huyện là bắt buộc"),
  ward: z.string().min(1, "Xã/Phường là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  managerId: z.string().min(1, "Quản lý cửa hàng là bắt buộc"),
  isActive: z.boolean(),
});

type StoreFormValues = z.infer<typeof formSchema>;

interface StoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StoreFormValues) => void;
  initialData?: Partial<StoreFormValues>;
}

export function StoreDrawer({ open, onOpenChange, onSubmit, initialData }: StoreDrawerProps) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: "",
      name: "",
      brand: "",
      geo: "",
      type: "managed",
      province: "",
      district: "",
      ward: "",
      address: "",
      managerId: "",
      isActive: true,
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-bold tracking-tight">
            {initialData ? "Chỉnh sửa cửa hàng" : "Tạo cửa hàng mới"}
          </SheetTitle>
          <SheetDescription className="font-medium">
            Điền đầy đủ các thông tin bên dưới để quản lý cửa hàng trong hệ thống.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="grid grid-cols-2 gap-6 pb-20">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Mã cửa hàng <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="mc-018" {...field} className="focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tên cửa hàng <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Maycha Vincom Thảo Điền" {...field} className="focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Thương hiệu <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn thương hiệu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maycha">Maycha</SelectItem>
                          <SelectItem value="tch">The Coffee House</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="geo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Khu vực <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn khu vực" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hcm-east">HCM - Phía Đông</SelectItem>
                          <SelectItem value="hcm-west">HCM - Phía Tây</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-gray-400 italic">AM phụ trách khu vực này sẽ tự có phạm vi quản lý và theo dõi cửa hàng.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Loại cửa hàng <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="managed">Cửa hàng quản lý</SelectItem>
                          <SelectItem value="franchise">Cửa hàng nhượng quyền</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tỉnh / Thành <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn tỉnh / thành" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                          <SelectItem value="hn">Hà Nội</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                       <FormLabel className="font-bold">Xã / Phường <span className="text-red-500">*</span></FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn xã / phường" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ward-1">Phường 1</SelectItem>
                          <SelectItem value="ward-2">Phường 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="font-bold">Địa chỉ <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="159 Xa Lộ Hà Nội, TP. Thủ Đức" {...field} className="focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="font-bold">Quản lý cửa hàng chính <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Chọn user quản lý cửa hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user-1">Nguyễn Văn A (Store Manager)</SelectItem>
                          <SelectItem value="user-2">Trần Thị B (Area Manager)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50/30 col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold text-gray-900">Trạng thái hoạt động</FormLabel>
                        <p className="text-sm text-gray-500">Cho phép cửa hàng xuất hiện trong các đợt Audits.</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[120px]">Lưu thay đổi</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
