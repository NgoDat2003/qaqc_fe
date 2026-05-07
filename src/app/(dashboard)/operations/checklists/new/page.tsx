"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  GripVertical, 
  Trash2, 
  ChevronDown, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Settings2,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const REPOSITORY_MOCK = [
  { id: "c1", code: "C1.1", content: "Vệ sinh tay nắm cửa và kính mặt tiền sạch sẽ", group: "C" },
  { id: "c2", code: "C1.2", content: "Sàn nhà khu vực khách ngồi không có rác và vết bẩn", group: "C" },
  { id: "e1", code: "E1.1", content: "Nguyên liệu có tem nhãn đầy đủ (Ngày mở - Hết hạn)", group: "E", isCcp: true },
  { id: "e2", code: "E1.2", content: "Nhiệt độ tủ mát nằm trong khoảng 0-5 độ C", group: "E", isRisk: true },
  { id: "h1", code: "H2.3", content: "Chào khách đúng quy định", group: "H" },
];

export default function ChecklistBuilderPage() {
  const [sections, setSections] = useState([
    { id: "s1", name: "I. KHÔNG GIAN VÀ VỆ SINH CỬA HÀNG", criteria: [REPOSITORY_MOCK[0], REPOSITORY_MOCK[1]] },
    { id: "s2", name: "II. AN TOÀN VỆ SINH THỰC PHẨM", criteria: [REPOSITORY_MOCK[2]] },
  ]);

  const addSection = () => {
    const newId = `s${sections.length + 1}`;
    setSections([...sections, { id: newId, name: "SECTION MỚI", criteria: [] }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in slide-in-from-bottom-4 duration-700">
      {/* Top Header Builder */}
      <div className="flex items-center justify-between bg-white p-4 border-b rounded-t-3xl shadow-sm z-10">
        <div className="flex items-center gap-4">
            <Link href="/operations/checklists">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div className="space-y-0.5">
                <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Thiết kế Phiếu đánh giá</h1>
                <p className="text-[11px] font-bold text-gray-400 italic">Trình khởi tạo cấu trúc và nội dung audit chuyên sâu.</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-9 px-4 rounded-xl border-gray-200 font-bold text-gray-500 bg-gray-50">Draft Auto-saved</Badge>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-black shadow-lg shadow-emerald-200 rounded-xl px-6 h-11 text-white">
                <Save className="h-4 w-4" /> Xuất bản phiếu
            </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Form Settings */}
        <div className="w-[320px] bg-gray-50/50 border-r overflow-y-auto p-6 space-y-8">
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <Settings2 className="h-4 w-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Thông tin chung</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên bộ phiếu</label>
                        <Input placeholder="Nhập tên phiếu..." defaultValue="Bộ tiêu chuẩn QA 2024" className="h-11 rounded-xl border-gray-200 font-bold shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thương hiệu áp dụng</label>
                        <Select>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold bg-white shadow-sm">
                                <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* TODO: load brands from API */}
                                <SelectItem value="" disabled>Chưa có dữ liệu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chu kỳ đánh giá</label>
                        <Select defaultValue="monthly">
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 font-bold bg-white shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly" className="font-bold">Định kỳ hàng tháng</SelectItem>
                                <SelectItem value="quarterly" className="font-bold">Định kỳ quý</SelectItem>
                                <SelectItem value="random" className="font-bold">Đột xuất (Random)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section className="space-y-4 pt-4 border-t">
                 <div className="flex items-center gap-2 text-primary">
                    <Layers className="h-4 w-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Tóm tắt cấu trúc</h3>
                </div>
                <div className="space-y-3">
                    {sections.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                            <span className="text-[10px] font-bold text-gray-700 truncate flex-1">{s.name}</span>
                            <Badge variant="secondary" className="text-[9px] font-black h-5 px-1.5">{s.criteria.length}</Badge>
                        </div>
                    ))}
                    <Button variant="ghost" onClick={addSection} className="w-full justify-start text-[10px] font-black uppercase text-primary hover:bg-primary/5 gap-2 h-10 rounded-xl">
                        <Plus className="h-3.5 w-3.5" /> Thêm Section
                    </Button>
                </div>
            </section>
        </div>

        {/* Main Content: Builder Workspace */}
        <div className="flex-1 bg-white overflow-y-auto">
            <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto p-12 space-y-12">
                    {sections.map((section, sIdx) => (
                        <div key={section.id} className="space-y-6 group/section">
                            <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <GripVertical className="h-5 w-5 text-gray-300 cursor-grab active:cursor-grabbing" />
                                    <Input 
                                        value={section.name} 
                                        onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[sIdx].name = e.target.value;
                                            setSections(newSections);
                                        }}
                                        className="border-none bg-transparent h-auto p-0 text-lg font-black text-gray-900 focus-visible:ring-0 shadow-none uppercase tracking-tight" 
                                    />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeSection(section.id)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/section:opacity-100 transition-opacity rounded-full h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-3 pl-9">
                                {section.criteria.map((item) => (
                                    <Card key={item.id} className="border-none bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-2xl group/item relative shadow-sm">
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className="pt-1 flex flex-col gap-2">
                                                <Badge variant="outline" className="font-black text-[9px] bg-white border-primary/20 text-primary">{item.code}</Badge>
                                                {item.isCcp && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                                {item.isRisk && <ShieldAlert className="h-4 w-4 text-red-500" />}
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed flex-1 italic">{item.content}</p>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover/item:opacity-100 h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}

                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
                                    <Plus className="h-3.5 w-3.5 mr-2" /> Thêm tiêu chuẩn vào section
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button onClick={addSection} variant="outline" className="w-full border-dashed border-2 py-8 rounded-3xl font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:border-primary transition-all gap-3 bg-gray-50/20">
                        <Plus className="h-5 w-5" /> Thêm Section mới vào phiếu
                    </Button>
                </div>
            </ScrollArea>
        </div>

        {/* Right Sidebar: Criteria Repository */}
        <div className="w-[360px] border-l bg-white flex flex-col overflow-hidden">
            <div className="p-5 border-b space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-primary" /> Kho tiêu chuẩn
                    </h3>
                    <Badge className="bg-primary/10 text-primary font-black text-[10px]">120 criteria</Badge>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <Input placeholder="Tìm mã lỗi hoặc nội dung..." className="pl-9 h-10 rounded-xl bg-gray-50 border-none text-xs font-bold" />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <Badge className="bg-primary text-white rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-tighter shrink-0 cursor-pointer">All</Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-tighter shrink-0 cursor-pointer">C - Vệ sinh</Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-tighter shrink-0 cursor-pointer">E - An toàn</Badge>
                </div>
            </div>

            <ScrollArea className="flex-1 p-5">
                <div className="space-y-4">
                    {REPOSITORY_MOCK.map(item => (
                        <div key={item.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            <div className="flex items-start justify-between gap-3">
                                <Badge variant="secondary" className="font-black text-[9px] uppercase bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{item.code}</Badge>
                                <Button size="sm" className="h-6 w-6 p-0 rounded-full bg-gray-50 text-gray-400 hover:bg-primary hover:text-white border-none shadow-none">
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <p className="mt-2 text-xs font-bold text-gray-600 leading-relaxed text-justify line-clamp-2 italic">{item.content}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}
