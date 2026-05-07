"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Plus, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  title: z.string().min(1, "Chức danh là bắt buộc"),
  phone: z.string().optional(),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  permissions: z.array(z.object({
    role: z.string().min(1, "Vai trò là bắt buộc"),
    scope: z.string().min(1, "Phạm vi là bắt buộc"),
    targetId: z.string().optional(),
  })).min(1, "Ít nhất phải có một vai trò"),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  initialData?: Partial<UserFormValues>;
}

export function UserDrawer({ open, onOpenChange, onSubmit, initialData }: UserDrawerProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fullName: "",
      email: "",
      title: "",
      phone: "",
      status: "active",
      permissions: [
        { role: "QC", scope: "global", targetId: "all" }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "permissions",
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[550px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <SheetTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {initialData ? "Cập nhật người dùng" : "Tạo người dùng mới"}
          </SheetTitle>
          <SheetDescription className="font-bold text-gray-400">
            Thiết lập tài khoản, phân vai trò và phạm vi truy cập chuyên sâu.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 border-b bg-white">
                <TabsList className="bg-transparent h-14 p-0 gap-8">
                  <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-bold text-gray-400 data-[state=active]:text-primary gap-2 transition-all">
                    <UserIcon className="h-4 w-4" /> Thông tin cá nhân
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-bold text-gray-400 data-[state=active]:text-primary gap-2 transition-all">
                    <ShieldCheck className="h-4 w-4" /> Phân quyền hệ thống
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <TabsContent value="info" className="m-0 p-6 space-y-6">
                    {/* Info Banner */}
                    <div className="flex gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-gray-900 border-b border-primary/20 pb-1 mb-1 uppercase tracking-tighter">Xác thực tài khoản</p>
                            <p className="text-xs text-gray-700 leading-relaxed font-bold text-justify">
                                Email sẽ được dùng làm tên đăng nhập. Sau khi tạo, người dùng sẽ nhận được email hướng dẫn thiết lập mật khẩu.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 pt-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Họ và tên <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Họ và tên" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Email (Username) <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Chức danh <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Quản lý QA" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary font-bold shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400 text-gray-400">Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input placeholder="090..." {...field} className="h-11 rounded-xl border-gray-200 focus:border-gray-300 font-bold shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Trạng thái tài khoản <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold focus:ring-primary shadow-sm">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active" className="font-bold">Đang hoạt động</SelectItem>
                                        <SelectItem value="inactive" className="font-bold">Tạm khóa tài khoản</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  </TabsContent>

                  <TabsContent value="roles" className="m-0 p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-dashed pb-4">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Cấu hình vai trò</h4>
                            <p className="text-xs font-bold text-gray-400 italic">User có thể đảm nhận cùng lúc nhiều vai trò.</p>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 rounded-full border-primary text-primary hover:bg-primary/5 font-black text-[11px] uppercase"
                            onClick={() => append({ role: "", scope: "global", targetId: "all" })}
                        >
                            <Plus className="h-3 w-3" /> Thêm vai trò
                        </Button>
                    </div>

                    <div className="space-y-6 pt-2">
                        {fields.map((item, index) => (
                            <div key={item.id} className="p-5 rounded-2xl border bg-gray-50/30 space-y-5 relative group border-primary/20">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-red-100 text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`permissions.${index}.role`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black text-[10px] uppercase tracking-widest text-gray-400">Vai trò</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white font-bold text-sm shadow-sm">
                                                            <SelectValue placeholder="Chọn vai trò" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="CA" className="font-bold italic">Central Admin (CA)</SelectItem>
                                                        <SelectItem value="QAM" className="font-bold">QA Manager (QAM)</SelectItem>
                                                        <SelectItem value="QC" className="font-bold">QC Staff (QC)</SelectItem>
                                                        <SelectItem value="AM" className="font-bold">Area Manager (AM)</SelectItem>
                                                        <SelectItem value="SM" className="font-bold">Store Manager (SM)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`permissions.${index}.scope`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black text-[10px] uppercase tracking-widest text-gray-400">Phạm vi (Scope)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white font-bold text-sm shadow-sm">
                                                            <SelectValue placeholder="Chọn phạm vi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="global" className="font-bold">Toàn hệ thống</SelectItem>
                                                        <SelectItem value="regional" className="font-bold italic text-primary">Theo khu vực (Region)</SelectItem>
                                                        <SelectItem value="store" className="font-bold italic text-amber-600">Theo cửa hàng (Store)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Dynamic Target Selector (Simulated) */}
                                <div className="space-y-2 pt-1">
                                    <label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Chọn đối tượng áp dụng</label>
                                    <div className="p-3 bg-white border rounded-xl flex items-center justify-between border-dashed border-gray-300">
                                         <span className="text-xs font-bold text-gray-400 italic">Chọn khu vực hoặc cửa hàng cụ thể...</span>
                                         <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>

            <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6">Hủy</Button>
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px] rounded-xl font-black h-11 shadow-lg shadow-primary/20">Lưu tài khoản</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function ChevronDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
