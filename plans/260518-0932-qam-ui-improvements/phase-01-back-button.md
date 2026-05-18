# Phase 1 — Back Button trong PageHeader

**Effort:** 10 phút | **Status:** pending

## Overview

Thêm prop `backHref?: string` vào `PageHeader`. Khi set, render arrow back trước title link sang URL đó. Apply cho 2 trang detail (audit plan, checklist builder).

## Files

**Modify:**
- `src/shared/components/page-header.tsx`
- `src/app/(dashboard)/qam/audit-plans/[id]/page.tsx`
- `src/app/(dashboard)/qam/checklists/[id]/page.tsx`

## Implementation steps

### 1. Update `page-header.tsx`

```tsx
import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title, subtitle, backHref, children, className,
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="flex items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Quay lại"
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
}
```

### 2. Apply ở `audit-plans/[id]/page.tsx`

```tsx
<PageHeader
  title={plan.name}
  backHref="/qam/audit-plans"
  subtitle={`${plan.form?.name ?? "—"} v${plan.form?.version ?? ""} · ${dateRange} · ${statusLabel}`}
/>
```

### 3. Apply ở `checklists/[id]/page.tsx`

Thêm `backHref="/qam/checklists"` vào `<PageHeader>` hiện có (line 181).

## Success criteria

- Click arrow → navigate đến list page
- Khi không truyền `backHref`, behavior y hệt trước (backwards compatible)
- `npm run typecheck` pass
- Layout không vỡ ở mobile (icon + title cùng hàng)
