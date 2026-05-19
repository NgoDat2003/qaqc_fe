"use client";

import { ListChecks } from "lucide-react";
import { PageHeader, EmptyState } from "@/shared/components";

export default function QcActionPlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Plan"
        subtitle="Kế hoạch khắc phục lỗi từ các bài kiểm tra"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng Action Plan", value: "—" },
          { label: "Đang chờ xử lý", value: "—" },
          { label: "Đã đóng", value: "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <EmptyState
        title="Chưa có Action Plan"
        description="Action Plan được tạo tự động khi bài kiểm tra có lỗi. Danh sách sẽ hiển thị sau khi API được cung cấp."
      />
    </div>
  );
}
