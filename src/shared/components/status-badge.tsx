import { cn } from "@/lib/utils";

export type AppStatus =
  | "active" | "inactive" | "locked"
  | "draft" | "published" | "archived"
  | "open" | "closed"
  | "pending" | "in_progress" | "completed"
  | "submitted"
  | "alarm";

const STATUS_CONFIG: Record<AppStatus, { label: string; className: string }> = {
  active:      { label: "Đang hoạt động",  className: "bg-success-bg text-success border-success/20" },
  inactive:    { label: "Ngừng hoạt động", className: "bg-muted text-muted-foreground border-border" },
  locked:      { label: "Đã khóa",         className: "bg-danger-bg text-danger border-danger/20" },
  draft:       { label: "Nháp",            className: "bg-warning-bg text-warning border-warning/20" },
  published:   { label: "Đã xuất bản",     className: "bg-success-bg text-success border-success/20" },
  archived:    { label: "Lưu trữ",         className: "bg-muted text-muted-foreground border-border" },
  open:        { label: "Đang mở",         className: "bg-info-bg text-info border-info/20" },
  closed:      { label: "Đã đóng",         className: "bg-muted text-muted-foreground border-border" },
  pending:     { label: "Chờ xử lý",       className: "bg-warning-bg text-warning border-warning/20" },
  in_progress: { label: "Đang thực hiện",  className: "bg-info-bg text-info border-info/20" },
  completed:   { label: "Hoàn thành",      className: "bg-success-bg text-success border-success/20" },
  submitted:   { label: "Đã nộp",          className: "bg-info-bg text-info border-info/20" },
  alarm:       { label: "Báo động",        className: "bg-danger-bg text-danger border-danger/20" },
};

export interface StatusBadgeProps {
  status: AppStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
