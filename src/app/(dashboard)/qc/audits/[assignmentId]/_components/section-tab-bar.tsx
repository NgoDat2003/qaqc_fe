"use client";

import { cn } from "@/lib/utils";
import type { VirtualSection } from "../_lib/build-virtual-sections";

interface SectionTabBarProps {
  sections: VirtualSection[];
  activeId: string;
  onChange: (id: string) => void;
}

const TONE_ACTIVE: Record<VirtualSection["tone"], string> = {
  default:  "border-primary text-primary",
  critical: "border-destructive text-destructive",
  warning:  "border-warning text-warning",
};

const TONE_INACTIVE: Record<VirtualSection["tone"], string> = {
  default:  "text-muted-foreground hover:text-foreground",
  critical: "text-destructive/60 hover:text-destructive",
  warning:  "text-warning/60 hover:text-warning",
};

export function SectionTabBar({ sections, activeId, onChange }: SectionTabBarProps) {
  return (
    <div className="flex overflow-x-auto border-b bg-background sticky top-0 z-10 shrink-0">
      {sections.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              active
                ? TONE_ACTIVE[s.tone]
                : cn("border-transparent", TONE_INACTIVE[s.tone])
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
