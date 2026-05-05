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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ShieldAlert } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(1, "Mã tiêu chuẩn là bắt buộc"),
  group: z.string().min(1, "Nhóm là bắt buộc"),
  content: z.string().min(1, "Nội dung tiêu chuẩn là bắt buộc"),
  deduction: z.number().min(0),
  maxDeduct: z.number().min(0),
  isRisk: z.boolean(),
  isCcp: z.boolean(),
});

type CriteriaFormValues = z.infer<typeof formSchema>;

interface CriteriaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CriteriaFormValues) => void;
  initialData?: Partial<CriteriaFormValues>;
}

export function CriteriaDrawer({ open, onOpenChange, onSubmit, initialData }: CriteriaDrawerProps) {
  const form = useForm<CriteriaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: "",
      group: "C",
      content: "",
      deduction: 1,
      maxDeduct: 5,
      isRisk: false,
      isCcp: false,
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <AlertCircle className="h-6 w-6 text-primary" />
            {initialData ? "Chỉnh sửa tiêu chuẩn" : "Thêm tiêu chuẩn mới"}
          </SheetTitle>
          <SheetDescription className="font-bold text-gray-400">
            Định nghĩa quy tắc chấm điểm và mức độ nghiêm trọng cho lỗi audit.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Mã tiêu chuẩn <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input placeholder="C1.1" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Nhóm <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold focus:ring-primary shadow-sm">
                                <SelectValue placeholder="Chọn nhóm" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="C" className="font-bold text-blue-600">Cleanliness (Vệ sinh)</SelectItem>
                                <SelectItem value="H" className="font-bold text-amber-600">Hospitality (Phục vụ)</SelectItem>
                                <SelectItem value="P" className="font-bold text-emerald-600">Product (Sản phẩm)</SelectItem>
                                <SelectItem value="E" className="font-bold text-red-600">Environment/Safety</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Nội dung chi tiết <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                            placeholder="Mô tả cụ thể tiêu chuẩn cần đánh giá..." 
                            className="min-h-[120px] rounded-xl border-gray-200 focus:border-primary font-medium shadow-sm leading-relaxed" 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="deduction"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Điểm trừ mỗi lỗi</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} className="h-11 rounded-xl border-gray-200 font-bold shadow-sm" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="maxDeduct"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Trừ tối đa</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} className="h-11 rounded-xl border-gray-200 font-bold shadow-sm" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl border bg-red-50/30 border-red-100 group transition-all hover:bg-red-50/50">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Critical Risk</p>
                                <p className="text-[10px] font-bold text-gray-400 italic">Gây nguy hiểm trực tiếp đến vận hành.</p>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="isRisk"
                            render={({ field }) => (
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border bg-amber-50/30 border-amber-100 group transition-all hover:bg-amber-50/50">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">CCP (Critical Control Point)</p>
                                <p className="text-[10px] font-bold text-gray-400 italic">Điểm kiểm soát an toàn thực phẩm.</p>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="isCcp"
                            render={({ field }) => (
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            )}
                        />
                    </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6">Hủy</Button>
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px] rounded-xl font-black h-11 shadow-lg shadow-primary/20 text-white">Lưu tiêu chuẩn</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
