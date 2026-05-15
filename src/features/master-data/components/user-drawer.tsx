"use client";

import { useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Plus, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { ComboboxInput } from "@/shared/components/combobox-input";
import { useStores } from "../hooks/use-stores";

const formSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  email:    z.string().email("Email không hợp lệ"),
  password: z.string().optional(), // required on create, omitted on edit
  phone:    z.string().optional(),
  permissions: z.array(z.object({
    role:     z.string().min(1, "Vai trò là bắt buộc"),
    scope:    z.string().min(1),
    targetId: z.string().optional(),
  })).min(1, "Ít nhất phải có một vai trò"),
});

export type UserFormValues = z.infer<typeof formSchema>;

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  initialData?: Partial<UserFormValues>;
}

export function UserDrawer({ open, onOpenChange, onSubmit, initialData }: UserDrawerProps) {
  const isEdit = !!initialData;
  const { data: stores = [] } = useStores();
  const storeOptions = stores.map((s) => ({ value: s.id, label: `${s.brand?.name ?? ""} — ${s.name} (${s.code})` }));

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fullName: "", email: "", password: "", phone: "",
      permissions: [{ role: "qc_auditor", scope: "global", targetId: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "permissions",
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData ?? {
        fullName: "", email: "", password: "", phone: "",
        permissions: [{ role: "qc_auditor", scope: "global", targetId: "" }],
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
              <div className="px-6 border-b bg-white shrink-0">
                <TabsList className="bg-transparent h-14 p-0 gap-8">
                  <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-bold text-gray-400 data-[state=active]:text-primary gap-2 transition-all">
                    <UserIcon className="h-4 w-4" /> Thông tin cá nhân
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-full font-bold text-gray-400 data-[state=active]:text-primary gap-2 transition-all">
                    <ShieldCheck className="h-4 w-4" /> Phân quyền hệ thống
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
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
                            {/* Password — only shown on create, not on edit */}
                            {!isEdit && (
                              <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Mật khẩu <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Tối thiểu 6 ký tự" {...field} className="h-11 rounded-xl border-gray-200 focus:border-primary shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input placeholder="090..." {...field} className="h-11 rounded-xl border-gray-200 focus:border-gray-300 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="roles" className="m-0 p-6 space-y-6">
                    {isEdit && (
                      <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Vai trò không thể thay đổi qua chỉnh sửa. Để cập nhật phân quyền, xóa và tạo lại tài khoản.</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-b border-dashed pb-4">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Cấu hình vai trò</h4>
                            <p className="text-xs font-bold text-gray-400 italic">User có thể đảm nhận cùng lúc nhiều vai trò.</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isEdit}
                            className="gap-1 rounded-full border-primary text-primary hover:bg-primary/5 font-black text-[11px] uppercase disabled:opacity-50"
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
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white font-bold text-sm shadow-sm">
                                                            <SelectValue placeholder="Chọn vai trò" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="company_admin" className="font-bold italic">Central Admin (CA)</SelectItem>
                                                        <SelectItem value="qa_manager" className="font-bold">QA Manager (QAM)</SelectItem>
                                                        <SelectItem value="qc_auditor" className="font-bold">QC Staff (QC)</SelectItem>
                                                        <SelectItem value="am" className="font-bold">Area Manager (AM)</SelectItem>
                                                        <SelectItem value="store_manager" className="font-bold">Store Manager (SM)</SelectItem>
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
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white font-bold text-sm shadow-sm">
                                                            <SelectValue placeholder="Chọn phạm vi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="global" className="font-bold">Toàn hệ thống</SelectItem>
                                                        <SelectItem value="store" className="font-bold italic text-amber-600">Theo cửa hàng cụ thể</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Store selector — only shown when scope = store */}
                                {form.watch(`permissions.${index}.scope`) === "store" && (
                                  <FormField
                                    control={form.control}
                                    name={`permissions.${index}.targetId`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-black text-[10px] uppercase tracking-widest text-gray-400">
                                          Cửa hàng phụ trách <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <ComboboxInput
                                          options={storeOptions}
                                          value={field.value || ""}
                                          onChange={field.onChange}
                                          placeholder="Tìm và chọn cửa hàng..."
                                          emptyText="Không tìm thấy cửa hàng"
                                          className="h-10 rounded-xl border-gray-200 bg-white"
                                        />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                            </div>
                        ))}
                    </div>
                  </TabsContent>
              </div>
            </Tabs>

            <div className="p-6 border-t bg-background flex justify-end gap-3 shrink-0">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6">Hủy</Button>
               <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px] rounded-xl font-black h-11 shadow-lg shadow-primary/20">Lưu tài khoản</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

