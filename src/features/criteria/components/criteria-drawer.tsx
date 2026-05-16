"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComboboxInput } from "@/shared/components";
import { DRAWER_LABEL, DRAWER_INPUT, DRAWER_SELECT } from "@/shared/styles/drawer-form-styles";
import { useCriteriaGroups } from "../hooks/use-criteria-groups";
import { BookOpen } from "lucide-react";

const schema = z.object({
  code:              z.string().min(1, "Mã tiêu chí là bắt buộc"),
  content:           z.string().min(5, "Nội dung tiêu chí là bắt buộc"),
  groupId:           z.string().min(1, "Nhóm tiêu chí là bắt buộc"),
  deductionPerError: z.number().min(0.5, "Tối thiểu 0.5"),
  maxDeduction:      z.number().min(0.5, "Tối thiểu 0.5"),
  flag:              z.enum(["none", "critical", "risk"]),
  isActive:          z.boolean(),
}).refine((d) => d.maxDeduction >= d.deductionPerError, {
  message: "Trừ tối đa phải ≥ trừ mỗi lỗi",
  path: ["maxDeduction"],
});

export type CriteriaFormValues = z.infer<typeof schema>;

const DEFAULTS: CriteriaFormValues = {
  code: "", content: "", groupId: "",
  deductionPerError: 1, maxDeduction: 5, flag: "none", isActive: true,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CriteriaFormValues) => Promise<void>;
  initialData?: Partial<CriteriaFormValues>;
}

export function CriteriaDrawer({ open, onOpenChange, onSubmit, initialData }: Props) {
  const isEdit = !!initialData?.code;
  const form = useForm<CriteriaFormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const { data: groups = [] } = useCriteriaGroups();
  const groupOptions = groups.filter((g) => g.isActive).map((g) => ({
    value: g.id, label: `${g.code} — ${g.name}`,
  }));

  useEffect(() => {
    if (open) form.reset(initialData ? { ...DEFAULTS, ...initialData } : DEFAULTS);
  }, [open, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-muted/30 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEdit ? "Cập nhật tiêu chí" : "Thêm tiêu chí"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Tiêu chí kiểm tra trong bài audit.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={DRAWER_LABEL}>Mã tiêu chí *</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${DRAWER_INPUT} font-mono`}
                        placeholder="VD: C001" disabled={isEdit} />
                    </FormControl>
                    {isEdit && <p className="text-xs text-muted-foreground">Mã không thể thay đổi.</p>}
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="groupId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={DRAWER_LABEL}>Nhóm *</FormLabel>
                    <ComboboxInput options={groupOptions} value={field.value}
                      onChange={field.onChange} placeholder="Chọn nhóm" className={DRAWER_SELECT} />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel className={DRAWER_LABEL}>Nội dung tiêu chí *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className="rounded-lg border-input resize-none"
                      placeholder="Mô tả chi tiết tiêu chí kiểm tra..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="deductionPerError" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={DRAWER_LABEL}>Trừ mỗi lỗi *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0.5"
                        value={field.value} onChange={(e) => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? 0 : v); }}
                        className={DRAWER_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="maxDeduction" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={DRAWER_LABEL}>Trừ tối đa *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0.5"
                        value={field.value} onChange={(e) => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? 0 : v); }}
                        className={DRAWER_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="flag" render={({ field }) => (
                <FormItem>
                  <FormLabel className={DRAWER_LABEL}>Cờ đặc biệt</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className={DRAWER_SELECT}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Bình thường</SelectItem>
                      <SelectItem value="critical">CCP — Critical (nhóm về 0)</SelectItem>
                      <SelectItem value="risk">RISK — Toàn bài về 0</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {isEdit && (
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
                    <div>
                      <FormLabel className="text-sm font-medium text-foreground">Đang hoạt động</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Tiêu chí được phép thêm vào checklist</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              )}
            </div>

            <div className="shrink-0 p-6 border-t bg-background flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg h-10 px-5" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" className="bg-primary rounded-lg h-10 min-w-[130px] font-semibold">
                {isEdit ? "Lưu thay đổi" : "Tạo tiêu chí"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
