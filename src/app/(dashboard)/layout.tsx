"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, ROLE_LABELS } from "@/shared/components/app-sidebar";
import { GlobalLoadingBar } from "@/shared/components";
import type { RoleKey } from "@/shared/types";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import { useMe } from "@/features/auth/hooks/use-me";

// ---------------------------------------------------------------------------
// Breadcrumb label map
// ---------------------------------------------------------------------------
const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "master-data": "Master Data",
  organization: "Brands & Stores",
  users: "Users",
  import: "Import Data",
  operations: "Operations",
  criteria: "Criteria Library",
  groups: "Groups",
  checklists: "Checklists",
  "audit-plans": "Audit Plans",
  audits: "Audit Results",
  "my-audits": "My Audits",
  "action-plan": "Action Plans",
  reports: "Reports",
  execute: "Execute Audit",
};

function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: PATH_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
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
// Skeleton while auth hydrates
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const breadcrumb = useBreadcrumb();
  const { user, activeRole, isAuthenticated, logout } = useAuthStore();
  const { notificationCount } = useUIStore();

  // Hydrate auth state from server on mount
  const { isLoading, isError } = useMe();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isError) {
      logout();
      router.replace("/login");
    }
  }, [isError, router, logout]);

  // Wait for client mount to avoid Zustand persist hydration mismatch
  if (!mounted || isLoading) {
    return <LoadingSkeleton />;
  }

  // Final check: if after loading we still aren't authenticated
  if (!isAuthenticated) {
    return <LoadingSkeleton />;
  }

  const roleLabel = ROLE_LABELS[activeRole as RoleKey] ?? "User";
  const initials = getInitials(user?.fullName ?? "U");

  return (
    <SidebarProvider>
      <GlobalLoadingBar />
      <AppSidebar />

      <SidebarInset className="bg-background min-w-0 overflow-x-hidden">
        {/* ── Top Header ── */}
        <header className="h-14 flex items-center gap-2 px-4 border-b border-border bg-card sticky top-0 z-20">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors">
            <PanelLeft className="h-4 w-4" />
          </SidebarTrigger>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
            <span className="text-muted-foreground hidden sm:inline shrink-0">QualityOps</span>
            {breadcrumb.map((crumb) => (
              <React.Fragment key={crumb.href}>
                <span className="text-muted-foreground hidden sm:inline">/</span>
                <span
                  className={cn(
                    "truncate",
                    crumb.isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hidden sm:inline"
                  )}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Right: Bell + User */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
              )}
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <button className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-md hover:bg-muted transition-colors group">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {user?.fullName ?? "User"}
                </span>
                <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex flex-1 flex-col p-6 gap-6 min-h-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
