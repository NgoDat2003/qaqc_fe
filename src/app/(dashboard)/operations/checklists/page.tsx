"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Settings2, Eye, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput, PaginationControls } from "@/shared/components";
import { useChecklists } from "@/features/checklist";
import type { ChecklistSummary } from "@/shared/types";

export default function ChecklistsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const { data, isLoading } = useChecklists({
    page,
    limit: 12,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const checklists = data?.data ?? [];
  const meta = data?.meta;

  const filtered = search
    ? checklists.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : checklists;

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
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm tên bộ phiếu hoặc phiên bản..."
          className="w-full max-w-md"
        />
        <div className="flex items-center gap-3">
          <Badge
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer ${statusFilter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Tất cả
          </Badge>
          <Badge
            onClick={() => setStatusFilter("published")}
            className={`border px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer ${statusFilter === "published" ? "bg-emerald-500 text-white border-emerald-500" : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"}`}
          >
            Đã xuất bản
          </Badge>
          <Badge
            onClick={() => setStatusFilter("draft")}
            className={`border px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider cursor-pointer ${statusFilter === "draft" ? "bg-amber-400 text-white border-amber-400" : "border-amber-100 text-amber-600 hover:bg-amber-50"}`}
          >
            Bản nháp
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((form: ChecklistSummary) => (
              <Card key={form.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white rounded-3xl">
                <CardHeader className="p-6 bg-gray-50/50 border-b relative">
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={form.status === "published" ? "default" : "secondary"}
                      className={`font-black text-[9px] uppercase tracking-widest ${form.status === "published" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                      {form.status === "published" ? "Active" : "Draft"}
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
                      <p className="text-xl font-black text-gray-900">
                        {form._count.sections} <span className="text-xs font-bold text-gray-400">Section</span>
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Plans</p>
                      <p className="text-xl font-black text-gray-900">
                        {form._count.auditPlans} <span className="text-xs font-bold text-gray-400">Plans</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 italic">
                    <Calendar className="h-3.5 w-3.5" />
                    {form.publishedAt
                      ? <>Xuất bản: {new Date(form.publishedAt).toLocaleDateString("vi-VN")}</>
                      : <>Tạo: {new Date(form.createdAt).toLocaleDateString("vi-VN")}</>
                    }
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-gray-50/30 border-t grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5 hover:bg-white hover:text-primary rounded-xl">
                    <Eye className="h-3.5 w-3.5" /> Xem
                  </Button>
                  <Button variant="ghost" size="sm" className="font-bold text-xs gap-1.5 hover:bg-white hover:text-blue-600 rounded-xl">
                    <Settings2 className="h-3.5 w-3.5" /> Sửa
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-gray-200" />
                <p className="font-black text-gray-400 text-sm uppercase tracking-widest">Không có phiếu nào</p>
                <p className="text-xs text-gray-300 max-w-xs">Thay đổi bộ lọc hoặc tạo phiếu đánh giá mới.</p>
              </div>
            )}

            <div
              className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[300px]"
              onClick={() => {}}
            >
              <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Plus className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-black text-gray-900 uppercase tracking-tight">Tạo bộ phiếu mới</p>
                <p className="text-xs font-bold text-gray-400 mt-1 max-w-[200px]">Bắt đầu thiết kế quy trình đánh giá cho chiến dịch mới.</p>
              </div>
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="bg-white rounded-2xl border p-3">
              <PaginationControls page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
