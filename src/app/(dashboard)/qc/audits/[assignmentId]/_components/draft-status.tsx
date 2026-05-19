"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftStatusProps {
  isSaving: boolean;
  isError: boolean;
  lastSavedAt: Date | null;
}

function formatHHmm(d: Date) {
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function DraftStatus({ isSaving, isError, lastSavedAt }: DraftStatusProps) {
  if (isError) {
    return (
      <span className="inline-flex items-center gap-1 text-destructive text-xs">
        <AlertCircle className="w-3.5 h-3.5" /> Lỗi lưu nháp
      </span>
    );
  }
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu…
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-success")}>
        <Check className="w-3.5 h-3.5" /> Đã lưu lúc {formatHHmm(lastSavedAt)}
      </span>
    );
  }
  return null;
}
