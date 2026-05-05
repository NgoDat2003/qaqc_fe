"use client";

import { useState } from "react";
import { Plus, Search, FileText, Settings2, Eye, Copy, Trash2, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CHECKLISTS_MOCK = [
  { id: "1", name: "Bộ tiêu chuẩn QA Maycha 2024", version: "2.4.1", status: "published", sections: 8, criteriaCount: 120, updatedAt: "23/04/2026" },
  { id: "2", name: "Checklist QC Đột xuất - ATVSTP", version: "1.0.5", status: "published", sections: 4, criteriaCount: 45, updatedAt: "20/04/2026" },
  { id: "3", name: "Form Đánh giá Thử việc SM", version: "0.9.0", status: "draft", sections: 5, criteriaCount: 30, updatedAt: "15/04/2026" },
  { id: "4", name: "Tiêu chuẩn Vận hành Brand TCH", version: "3.2.0", status: "published", sections: 10, criteriaCount: 150, updatedAt: "10/04/2026" },
];

export default function ChecklistsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Hệ thống Phiếu đánh giá</h1>
          <p className="text-sm text-gray-500 font-bold italic">Thiết kế cấu trúc, phân nhóm và gán trọng số cho các bộ checklist audit chuyên sâu.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2 font-black shadow-lg shadow-primary/20 rounded-xl px-6 h-11">
            <Plus className="h-4 w-4" /> Tạo phiếu mới
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Tìm tên bộ phiếu hoặc phiên bản..." className="pl-10 h-10 bg-gray-50/50 focus:bg-white transition-all rounded-xl border-gray-100" />
        </div>
        <div className="flex items-center gap-3">
             <Badge className="bg-primary text-white px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer">Tất cả</Badge>
             <Badge variant="outline" className="border-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer hover:bg-emerald-50">Đã xuất bản</Badge>
             <Badge variant="outline" className="border-amber-100 text-amber-600 px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer hover:bg-amber-50">Bản nháp</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHECKLISTS_MOCK.map((form) => (
            <Card key={form.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white rounded-3xl">
                <CardHeader className="p-6 bg-gray-50/50 border-b relative">
                    <div className="absolute top-4 right-4">
                        <Badge variant={form.status === 'published' ? 'default' : 'secondary'} className={`font-black text-[9px] uppercase tracking-widest ${form.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {form.status === 'published' ? 'Active' : 'Draft'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-base font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{form.name}</CardTitle>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <Clock className="h-3 w-3" /> v{form.version}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số phân hệ</p>
                            <p className="text-xl font-black text-gray-900">{form.sections} <span className="text-xs font-bold text-gray-400">Section</span></p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiêu chuẩn</p>
                            <p className="text-xl font-black text-gray-900">{form.criteriaCount} <span className="text-xs font-bold text-gray-400">Lỗi</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 italic">
                        <Calendar className="h-3.5 w-3.5" /> Cập nhật lần cuối: {form.updatedAt}
                    </div>
                </CardContent>
                <CardFooter className="p-4 bg-gray-50/30 border-t grid grid-cols-3 gap-2">
                    <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5 hover:bg-white hover:text-primary rounded-xl">
                        <Eye className="h-3.5 w-3.5" /> Xem
                    </Button>
                    <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5 hover:bg-white hover:text-blue-600 rounded-xl">
                        <Settings2 className="h-3.5 w-3.5" /> Sửa
                    </Button>
                    <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5 hover:bg-white hover:text-red-600 rounded-xl">
                        <Trash2 className="h-3.5 w-3.5" /> Xóa
                    </Button>
                </CardFooter>
            </Card>
        ))}

        {/* Create Empty Placeholder */}
        <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[300px]">
            <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
                <p className="font-black text-gray-900 uppercase tracking-tight">Tạo bộ phiếu mới</p>
                <p className="text-xs font-bold text-gray-400 mt-1 max-w-[200px]">Bắt đầu thiết kế quy trình đánh giá cho chiến dịch mới.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
