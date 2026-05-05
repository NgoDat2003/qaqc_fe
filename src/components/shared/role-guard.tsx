"use client"

import { useAuthStore } from "@/stores/auth.store"
import { ReactNode, useEffect, useState } from "react"

export function RoleGuard({ allowedRoles, children, fallback = null }: { allowedRoles: string[], children: ReactNode, fallback?: ReactNode }) {
  const activeRole = useAuthStore(s => s.activeRole)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!activeRole || !allowedRoles.includes(activeRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
