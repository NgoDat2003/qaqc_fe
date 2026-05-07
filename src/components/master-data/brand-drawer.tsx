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
import { Flag } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Tên thương hiệu là bắt buộc"),
  code: z.string().min(1, "Mã định danh là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
});

type BrandFormValues = z.infer<typeof formSchema>;

interface BrandDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BrandFormValues) => void;
  initialData?: Partial<BrandFormValues>;
}

export function BrandDrawer({ open, onOpenChange, onSubmit, initialData }: BrandDrawerProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      status: "active",
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <Flag className="h-6 w-6 text-primary" />
            {initialData ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
          </SheetTitle>
          <SheetDescription className="font-bold text-gray-400">
            Quản lý các thương hiệu con trong hệ thống tập đoàn.
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
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Tên thương hiệu <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tên thương hiệu" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Mã thương hiệu <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: MC, TCH" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Trạng thái vận hành <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active" className="font-bold">Đang hoạt động</SelectItem>
                          <SelectItem value="inactive" className="font-bold">Ngừng khai thác</SelectItem>
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
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px] rounded-xl font-black h-11 shadow-lg shadow-primary/20 text-white">Lưu thông tin</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
