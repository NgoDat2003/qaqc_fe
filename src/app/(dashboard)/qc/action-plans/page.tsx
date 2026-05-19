"use client";

import { ListChecks, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader, EmptyState, MetricCard } from "@/shared/components";

export default function QcActionPlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Plan"
        subtitle="Kế hoạch khắc phục lỗi từ các bài kiểm tra"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Tổng Action Plan"  value="—" icon={ListChecks}   variant="default" />
        <MetricCard label="Đang chờ xử lý"   value="—" icon={Clock}        variant="warning" />
        <MetricCard label="Đã đóng"           value="—" icon={CheckCircle2} variant="success" />
      </div>

      <EmptyState
        title="Chưa có Action Plan"
        description="Action Plan được tạo tự động khi bài kiểm tra có lỗi. Danh sách sẽ hiển thị sau khi API được cung cấp."
      />
    </div>
  );
}
