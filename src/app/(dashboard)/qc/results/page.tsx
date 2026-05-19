"use client";

import { BarChart2, ClipboardCheck } from "lucide-react";
import { PageHeader, EmptyState } from "@/shared/components";

export default function QcResultsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết quả kiểm tra"
        subtitle="Danh sách bài kiểm tra đã hoàn thành"
      />

      {/* Placeholder — real data will come from API later */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng bài đã kiểm tra", value: "—", icon: ClipboardCheck },
          { label: "Điểm trung bình", value: "—", icon: BarChart2 },
          { label: "Bài đạt (≥ 70%)", value: "—", icon: BarChart2 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <EmptyState
        title="Chưa có kết quả"
        description="Kết quả các bài kiểm tra đã nộp sẽ hiển thị ở đây sau khi API được cung cấp."
      />
    </div>
  );
}
