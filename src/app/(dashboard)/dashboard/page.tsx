"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getLandingPathByRole } from "@/lib/roles";

export default function DashboardPage() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);

  useEffect(() => {
    router.replace(getLandingPathByRole(activeRole));
  }, [activeRole, router]);

  return null;
}
