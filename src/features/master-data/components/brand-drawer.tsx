"use client";

import { useEffect } from "react";
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
import { Flag } from "lucide-react";
import { DRAWER_LABEL, DRAWER_INPUT, DRAWER_SELECT } from "@/shared/styles/drawer-form-styles";

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

  useEffect(() => {
    if (open) {
      form.reset(initialData ?? { name: "", code: "", status: "active" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            {initialData ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Quản lý các thương hiệu trong hệ thống.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={DRAWER_LABEL}>Tên thương hiệu <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Maycha, Tam Hảo" {...field} className={DRAWER_INPUT} />
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
                      <FormLabel className={DRAWER_LABEL}>
                        Mã thương hiệu {!initialData && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: MC, CLOUD"
                          {...field}
                          className={`${DRAWER_INPUT} font-mono`}
                          disabled={!!initialData}
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {initialData ? "Mã không thể thay đổi sau khi tạo." : "Viết hoa, không dấu, ngắn gọn."}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={DRAWER_LABEL}>Trạng thái vận hành <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={DRAWER_SELECT}>
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
            </div>

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
