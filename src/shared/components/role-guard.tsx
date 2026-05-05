"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { RoleKey } from "@/shared/types";

interface RoleGuardProps {
  roles: RoleKey[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const activeRole = useAuthStore((state) => state.activeRole);

  if (!activeRole || !roles.includes(activeRole as RoleKey)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
