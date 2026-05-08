import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VARIANT_ICON_CLASSES = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger:  "bg-danger-bg text-danger",
  info:    "bg-info-bg text-info",
} as const;

export interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  description?: string;
  variant?: keyof typeof VARIANT_ICON_CLASSES;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex items-center gap-4 p-4">
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              VARIANT_ICON_CLASSES[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold text-foreground">{value}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
