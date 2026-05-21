"use client";

import * as React from "react";
import {
  BarChart2,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { RoleKey } from "@/shared/types";
import { useAuthStore } from "@/stores/auth.store";

export const ROLE_LABELS: Record<string, string> = {
  company_admin: "Quản trị công ty",
  qa_manager: "QA Manager",
  qc_auditor: "QC Auditor",
  am: "Area Manager",
  store_manager: "Quản lý cửa hàng",
  executive_viewer: "Xem báo cáo",
};

type NavItem = { title: string; url: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const DASHBOARD_GROUP: NavGroup = {
  label: "Tong quan",
  items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
};

const ADMIN_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Thiết lập",
    items: [
      { title: "Thương hiệu & Cửa hàng", url: "/master-data/organization", icon: Store },
      { title: "Người dùng", url: "/master-data/users", icon: Users },
    ],
  },
];

const QC_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Công việc của tôi",
    items: [
      { title: "Lịch kiểm tra", url: "/qc/my-assignments", icon: ClipboardList },
      { title: "Kết quả kiểm tra", url: "/audits", icon: BarChart2 },
      { title: "Action Plan", url: "/action-plans", icon: ListChecks },
    ],
  },
];

const QAM_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Dữ liệu hệ thống",
    items: [
      { title: "Thương hiệu & Cửa hàng", url: "/master-data/organization", icon: Store },
      { title: "Người dùng", url: "/master-data/users", icon: Users },
    ],
  },
  {
    label: "Thiết lập chất lượng",
    items: [
      { title: "Nhóm tiêu chí", url: "/qam/criteria-groups", icon: Layers },
      { title: "Thư viện tiêu chí", url: "/qam/criteria", icon: BookOpen },
      { title: "Checklist", url: "/qam/checklists", icon: FileText },
      { title: "Kế hoạch Audit", url: "/qam/audit-plans", icon: CalendarCheck },
    ],
  },
  {
    label: "Kết quả & Khắc phục",
    items: [
      { title: "Kết quả kiểm tra", url: "/audits", icon: BarChart2 },
      { title: "Action Plan", url: "/action-plans", icon: ListChecks },
    ],
  },
];

const SM_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Cửa hàng",
    items: [
      { title: "Kết quả kiểm tra", url: "/audits", icon: BarChart2 },
      { title: "Action Plan", url: "/action-plans", icon: ListChecks },
    ],
  },
];

const AM_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Khu vực",
    items: [
      { title: "Kết quả kiểm tra", url: "/audits", icon: BarChart2 },
      { title: "Action Plan", url: "/action-plans", icon: ListChecks },
    ],
  },
];

const EXECUTIVE_NAV: NavGroup[] = [
  DASHBOARD_GROUP,
  {
    label: "Báo cáo",
    items: [
      { title: "Kết quả kiểm tra", url: "/audits", icon: BarChart2 },
      { title: "Action Plan", url: "/action-plans", icon: ListChecks },
    ],
  },
];

const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  company_admin: ADMIN_NAV,
  qa_manager: QAM_NAV,
  qc_auditor: QC_NAV,
  am: AM_NAV,
  store_manager: SM_NAV,
  executive_viewer: EXECUTIVE_NAV,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const roleKey = useAuthStore((state) => state.activeRole) as RoleKey | null;
  const { logout } = useAuthStore();

  const name = user?.fullName ?? "User";
  const roleLabel = roleKey ? (ROLE_LABELS[roleKey] ?? roleKey) : "Đang tải";
  const initials = getInitials(name);
  const navGroups = roleKey ? (NAV_BY_ROLE[roleKey] ?? []) : [];
  const homeHref = navGroups[0]?.items[0]?.url ?? "/dashboard";

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Logout should still clear the local session if the API call fails.
    }
    logout();
    router.push("/login");
  };

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-4">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
          <div className="flex aspect-square size-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
            QO
          </div>
          <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-accent-foreground">QualityOps</span>
            <span className="mt-1 truncate text-[10px] uppercase tracking-wider text-sidebar-foreground">
              {roleLabel}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-2">
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "h-9 rounded-lg px-2 transition-colors duration-150",
                          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active &&
                            "bg-sidebar-primary/15 text-sidebar-accent-foreground ring-1 ring-sidebar-primary/20"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")} />
                        <span className="text-sm">{item.title}</span>
                        {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-sidebar-primary opacity-70" />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${name} - ${roleLabel}`}
              className="h-auto cursor-default rounded-lg px-2 py-2 hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-sidebar-accent-foreground">{name}</span>
                <span className="truncate text-[10px] text-sidebar-foreground">{roleLabel}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="h-9 rounded-lg px-2 text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm">Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
