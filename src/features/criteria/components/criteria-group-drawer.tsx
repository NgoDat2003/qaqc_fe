"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DRAWER_LABEL, DRAWER_INPUT, DRAWER_SECTION_CLASS } from "@/shared/styles/drawer-form-styles";
import { Layers } from "lucide-react";

const schema = z.object({
  code:     z.string().min(1, "Mã nhóm là bắt buộc"),
  name:     z.string().min(2, "Tên nhóm là bắt buộc"),
  color:    z.string().optional(),
  isActive: z.boolean(),
});

export type CriteriaGroupFormValues = z.infer<typeof schema>;

const DEFAULTS: CriteriaGroupFormValues = { code: "", name: "", color: "#6366f1", isActive: true };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CriteriaGroupFormValues) => Promise<void>;
  initialData?: Partial<CriteriaGroupFormValues>;
}

export function CriteriaGroupDrawer({ open, onOpenChange, onSubmit, initialData }: Props) {
  const isEdit = !!initialData?.code;
  const form = useForm<CriteriaGroupFormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (open) form.reset(initialData ? { ...DEFAULTS, ...initialData } : DEFAULTS);
  }, [open, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[440px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-muted/30 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 text-primary" />
            {isEdit ? "Cập nhật nhóm tiêu chí" : "Thêm nhóm tiêu chí"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Nhóm tiêu chí dùng để phân loại bài kiểm tra (C, H, E, P).
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-5">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel className={DRAWER_LABEL}>Mã nhóm *</FormLabel>
                  <FormControl>
                    <Input {...field} className={`${DRAWER_INPUT} font-mono`}
                      placeholder="VD: C, H, E, P" disabled={isEdit} />
                  </FormControl>
                  {isEdit && <p className="text-xs text-muted-foreground">Mã không thể thay đổi sau khi tạo.</p>}
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className={DRAWER_LABEL}>Tên nhóm *</FormLabel>
                  <FormControl><Input {...field} className={DRAWER_INPUT} placeholder="VD: Vệ sinh, Dịch vụ, Hết hạn" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel className={DRAWER_LABEL}>Màu sắc</FormLabel>
                  <div className="flex items-center gap-3">
                    <input type="color" value={field.value ?? "#6366f1"} onChange={field.onChange}
                      className="h-10 w-16 rounded-lg border border-input cursor-pointer" />
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} className={`${DRAWER_INPUT} font-mono flex-1`}
                        placeholder="#6366f1" />
                    </FormControl>
                  </div>
                </FormItem>
              )} />

              {isEdit && (
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
                    <div>
                      <FormLabel className="text-sm font-medium text-foreground">Đang hoạt động</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Nhóm này được dùng trong các checklist</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              )}
            </div>

            <div className="shrink-0 p-6 border-t bg-background flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg h-10 px-5" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" className="bg-primary rounded-lg h-10 min-w-[120px] font-semibold">
                {isEdit ? "Lưu thay đổi" : "Tạo nhóm"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
