"use client";

import * as React from "react";
import { Store, Users, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api-client";
import type { RoleKey } from "@/shared/types";

export const ROLE_LABELS: Record<string, string> = {
  company_admin:     "Quản trị công ty",
  qa_manager:        "QA Manager",
  qc_auditor:        "QC Auditor",
  am:                "Area Manager",
  store_manager:     "Quản lý cửa hàng",
  executive_viewer:  "Xem báo cáo",
};

type NavItem = { title: string; url: string; icon: React.ElementType };

// Admin-only nav for dev branch. Other roles will be added per-phase.
const NAV_ITEMS: NavItem[] = [
  { title: "Thương hiệu & Cửa hàng", url: "/master-data/organization", icon: Store },
  { title: "Người dùng",             url: "/master-data/users",        icon: Users },
];

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const { logout } = useAuthStore();

  const name      = user?.fullName ?? "User";
  const email     = user?.email ?? "";
  const roleKey   = useAuthStore((s) => s.activeRole) as RoleKey | null;
  const roleLabel = roleKey ? (ROLE_LABELS[roleKey] ?? roleKey) : "...";
  const initials  = getInitials(name);

  const handleLogout = async () => {
    try { await apiClient.post("/auth/logout", {}); } catch { /* ignore */ }
    logout();
    router.push("/login");
  };

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      {/* Header */}
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/master-data/organization" className="flex items-center gap-3 min-w-0">
          <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
            QO
          </div>
          <div className="flex flex-col leading-none min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sidebar-accent-foreground text-sm">QualityOps</span>
            <span className="text-[10px] text-sidebar-foreground uppercase tracking-wider">Admin</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="py-2">
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-2 mb-1">
            Thiết lập
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        "h-9 px-2 rounded-lg transition-colors duration-150",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 flex-shrink-0", active && "text-primary")} />
                      <span className="text-sm">{item.title}</span>
                      {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary opacity-60" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${name} — ${roleLabel}`}
              className="h-auto py-2 px-2 hover:bg-sidebar-accent rounded-lg cursor-default"
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-medium text-sidebar-accent-foreground truncate">{name}</span>
                <span className="text-[10px] text-sidebar-foreground truncate">{roleLabel}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="h-9 px-2 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
