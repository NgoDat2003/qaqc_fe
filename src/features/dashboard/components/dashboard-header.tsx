import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/roles";
import type { RoleKey } from "@/shared/types";
import type { DashboardScope } from "../types";

export function RoleHeader({
  role,
  scope,
  generatedAt,
  isLoading,
}: {
  role: RoleKey | null;
  scope: DashboardScope | null;
  generatedAt?: string;
  isLoading: boolean;
}) {
  const roleName = role ? getRoleLabel(role) : "Dashboard";
  const title =
    scope === "qam"
      ? "Dashboard QA/QC"
      : scope === "admin"
        ? "Dashboard quản trị"
        : scope === "qc"
          ? "Dashboard công việc QC"
          : scope === "am"
            ? "Dashboard khu vực AM"
            : scope === "sm"
              ? "Dashboard cửa hàng SM"
              : "Dashboard thống kê";
  const description =
    scope === "sm"
      ? "Tổng quan chất lượng và Action Plan của cửa hàng."
      : "Dữ liệu lấy từ dashboard API theo role, BE đã enforcement scope RBAC cho Admin, QAM, QC, AM và SM.";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">{roleName}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Badge
        variant="outline"
        className="w-fit border-primary/25 bg-primary/5 px-3 py-1 text-primary"
      >
        {isLoading
          ? "Đang tải"
          : generatedAt
            ? `Cập nhật ${new Date(generatedAt).toLocaleString("vi-VN")}`
            : "Chờ dữ liệu BE"}
      </Badge>
    </div>
  );
}
