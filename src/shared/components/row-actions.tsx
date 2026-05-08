"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface RowActionsProps {
  actions: RowAction[];
  className?: string;
}

export function RowActions({ actions, className }: RowActionsProps) {
  return (
    <div
      className={cn("flex items-center justify-end", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.length <= 2 ? (
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  action.variant === "destructive" &&
                    "border-danger/20 text-danger hover:bg-danger-bg"
                )}
              >
                {Icon && <Icon className="mr-1 h-3.5 w-3.5" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon-sm" aria-label="Thao tác" />}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  variant={action.variant === "destructive" ? "destructive" : "default"}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
