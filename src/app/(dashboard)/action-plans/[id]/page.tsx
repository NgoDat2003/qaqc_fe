"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { useActionPlan } from "@/features/audit";
import { ApHeader } from "./_components/ap-header";
import { ApItemCard } from "./_components/ap-item-card";
import { ApSubmitBar } from "./_components/ap-submit-bar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActionPlanDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: ap, isLoading, isError } = useActionPlan(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !ap) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Không thể tải Action Plan. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <ApHeader ap={ap} />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          Danh sách vi phạm cần khắc phục ({ap.items.length})
        </h2>
        {ap.items.map((item) => (
          <ApItemCard key={item.id} item={item} ap={ap} />
        ))}
      </div>

      <ApSubmitBar ap={ap} />
    </div>
  );
}
