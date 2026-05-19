"use client";

import { BarChart2, ClipboardCheck, TrendingUp } from "lucide-react";
import { PageHeader, EmptyState, MetricCard } from "@/shared/components";

export default function QcResultsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết quả kiểm tra"
        subtitle="Danh sách bài kiểm tra đã hoàn thành"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Tổng bài đã kiểm tra" value="—" icon={ClipboardCheck} variant="default" />
        <MetricCard label="Điểm trung bình"       value="—" icon={BarChart2}     variant="info" />
        <MetricCard label="Bài đạt (≥ 70%)"       value="—" icon={TrendingUp}    variant="success" />
      </div>

      <EmptyState
        title="Chưa có kết quả"
        description="Kết quả các bài kiểm tra đã nộp sẽ hiển thị ở đây sau khi API được cung cấp."
      />
    </div>
  );
}
