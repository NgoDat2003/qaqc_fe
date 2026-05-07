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
import { MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Tên khu vực là bắt buộc"),
  managerId: z.string().min(1, "Vui lòng chọn AM phụ trách"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
});

type RegionFormValues = z.infer<typeof formSchema>;

interface RegionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegionFormValues) => void;
  initialData?: Partial<RegionFormValues>;
}

export function RegionDrawer({ open, onOpenChange, onSubmit, initialData }: RegionDrawerProps) {
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      managerId: "",
      status: "active",
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <MapPin className="h-6 w-6 text-primary" />
            {initialData ? "Cập nhật khu vực" : "Thêm khu vực mới"}
          </SheetTitle>
          <SheetDescription className="font-bold text-gray-400">
            Quản lý phân vùng địa lý và gán trách nhiệm giám sát (AM).
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6 py-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Tên khu vực / Địa bàn <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tên khu vực" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">AM Phụ trách <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Chọn Area Manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* TODO: load AM users from API */}
                          <SelectItem value="" disabled className="font-bold">Chưa có dữ liệu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Trạng thái <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active" className="font-bold">Hoạt động</SelectItem>
                          <SelectItem value="inactive" className="font-bold">Tạm khóa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6">Hủy</Button>
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px] rounded-xl font-black h-11 shadow-lg shadow-primary/20 text-white">Lưu khu vực</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
