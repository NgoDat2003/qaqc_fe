"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  LogOut,
  BarChart3,
  CalendarCheck,
  BookOpen,
  Store,
  Users,
  Upload,
  Layers,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api-client";
import type { RoleKey } from "@/shared/types";

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------
export const ROLE_KEYS = {
  COMPANY_ADMIN: "company_admin",
  QA_MANAGER: "qa_manager",
  QC_AUDITOR: "qc_auditor",
  AM: "am",
  STORE_MANAGER: "store_manager",
  EXECUTIVE_VIEWER: "executive_viewer",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [ROLE_KEYS.COMPANY_ADMIN]: "Company Admin",
  [ROLE_KEYS.QA_MANAGER]: "QA Manager",
  [ROLE_KEYS.QC_AUDITOR]: "QC Auditor",
  [ROLE_KEYS.AM]: "Area Manager",
  [ROLE_KEYS.STORE_MANAGER]: "Store Manager",
  [ROLE_KEYS.EXECUTIVE_VIEWER]: "Executive Viewer",
};

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------
type NavItem = { title: string; url: string; icon: React.ElementType };
type NavGroup = { title: string; items: NavItem[] };

const NAV_CONFIG: Record<string, NavGroup[]> = {
  [ROLE_KEYS.COMPANY_ADMIN]: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "System Setup",
      items: [
        { title: "Brands & Stores", url: "/master-data/organization", icon: Store },
        { title: "Locations", url: "/master-data/locations", icon: MapPin },
        { title: "Users", url: "/master-data/users", icon: Users },
        { title: "Import Data", url: "/master-data/import", icon: Upload },
      ],
    },
  ],

  [ROLE_KEYS.QA_MANAGER]: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Configuration",
      items: [
        { title: "Criteria Groups", url: "/operations/criteria/groups", icon: Layers },
        { title: "Criteria Library", url: "/operations/criteria", icon: BookOpen },
        { title: "Checklists", url: "/operations/checklists", icon: FileText },
      ],
    },
    {
      title: "Operations",
      items: [
        { title: "Audit Plans", url: "/operations/audit-plans", icon: CalendarCheck },
        { title: "Audit Results", url: "/operations/audits", icon: ClipboardCheck },
        { title: "Action Plans", url: "/operations/action-plan", icon: AlertTriangle },
        { title: "Reports", url: "/operations/reports", icon: BarChart3 },
      ],
    },
  ],

  [ROLE_KEYS.QC_AUDITOR]: [
    {
      title: "My Work",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "My Audits", url: "/operations/my-audits", icon: ClipboardCheck },
      ],
    },
  ],

  [ROLE_KEYS.AM]: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "My Area",
      items: [
        { title: "Audit Results", url: "/operations/audits", icon: ClipboardCheck },
        { title: "Action Plans", url: "/operations/action-plan", icon: AlertTriangle },
        { title: "Reports", url: "/operations/reports", icon: BarChart3 },
      ],
    },
  ],

  [ROLE_KEYS.STORE_MANAGER]: [
    {
      title: "My Store",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Audit History", url: "/operations/audits", icon: ClipboardCheck },
        { title: "Action Plan", url: "/operations/action-plan", icon: AlertTriangle },
      ],
    },
  ],

  [ROLE_KEYS.EXECUTIVE_VIEWER]: [
    {
      title: "Executive",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Reports", url: "/operations/reports", icon: BarChart3 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Hooks: read from Zustand (with localStorage fallback during hydration)
// ---------------------------------------------------------------------------
function useActiveRole(): RoleKey | null {
  return useAuthStore((s) => s.activeRole) as RoleKey | null;
}

function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  return {
    name: user?.fullName ?? "User",
    email: user?.email ?? "",
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const activeRole = useActiveRole();
  const { name, email } = useCurrentUser();

  const navGroups: NavGroup[] = activeRole ? (NAV_CONFIG[activeRole] ?? []) : [];
  const roleLabel = activeRole ? (ROLE_LABELS[activeRole] ?? activeRole) : "...";
  const initials = getInitials(name);

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // ignore logout API errors
    } finally {
      logout();
      router.push("/login");
    }
  };

  const isActive = (url: string) =>
    pathname === url || (url !== "/dashboard" && pathname.startsWith(url + "/"));

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      {/* ── Header ── */}
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs flex-shrink-0">
            QO
          </div>
          <div className="flex flex-col leading-none min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sidebar-accent-foreground text-sm">
              QualityOps
            </span>
            <span className="text-[10px] text-sidebar-foreground uppercase tracking-wider">
              Audit Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="py-2">
        {navGroups.map((group, groupIdx) => (
          <React.Fragment key={group.title}>
            {groupIdx > 0 && <SidebarSeparator className="bg-sidebar-border my-1" />}
            <SidebarGroup className="px-2">
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-2 mb-1">
                {group.title}
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
                            "h-9 px-2 rounded-lg transition-colors duration-150",
                            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-colors",
                              active ? "text-primary" : "text-sidebar-foreground"
                            )}
                          />
                          <span className="text-sm">{item.title}</span>
                          {active && (
                            <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary opacity-60" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* ── Footer: User + Logout ── */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {/* User info */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${name} — ${roleLabel}`}
              className="h-auto py-2 px-2 hover:bg-sidebar-accent rounded-lg cursor-default"
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {name}
                </span>
                <span className="text-[10px] text-sidebar-foreground truncate">
                  {roleLabel}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="h-9 px-2 rounded-lg text-sidebar-foreground hover:bg-danger-bg/10 hover:text-danger transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
