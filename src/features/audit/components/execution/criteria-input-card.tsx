"use client";
import { Plus, Minus, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ChecklistSectionItem } from "@/shared/types";

interface ViolationState {
  numErrors: number;
  note: string;
  evidenceUrls: string[];
}

interface CriteriaInputCardProps {
  item: ChecklistSectionItem;
  state: ViolationState;
  uploading: boolean;
  onErrorChange: (delta: number) => void;
  onNoteChange: (note: string) => void;
  onFileSelect: (file: File) => void;
}

const FLAG_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  risk:     "bg-orange-100 text-orange-700 border-orange-200",
};

export function CriteriaInputCard({
  item,
  state,
  uploading,
  onErrorChange,
  onNoteChange,
  onFileSelect,
}: CriteriaInputCardProps) {
  const criteria = item.criteria;
  const flag = criteria?.flag ?? "none";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">
          {criteria?.code ?? "—"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{criteria?.content ?? "—"}</p>
          {flag !== "none" && (
            <Badge variant="outline" className={`mt-1 text-[10px] ${FLAG_BADGE[flag]}`}>
              {flag.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-20">Số lỗi:</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => onErrorChange(-1)}
            disabled={state.numErrors <= 0}
            aria-label="Giảm lỗi"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">
            {state.numErrors}
          </span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => onErrorChange(1)}
            aria-label="Tăng lỗi"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {state.numErrors > 0 && (
        <>
          <Textarea
            placeholder="Ghi chú lỗi (tùy chọn)…"
            value={state.note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="text-sm resize-none h-16"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>{uploading ? "Đang tải…" : "Tải ảnh"}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileSelect(f);
                  e.target.value = "";
                }}
              />
            </label>
            {state.evidenceUrls.length > 0 && (
              <span className="text-xs text-green-600">
                {state.evidenceUrls.length} ảnh
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
