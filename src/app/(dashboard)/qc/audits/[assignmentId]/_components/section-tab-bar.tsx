"use client";

import { cn } from "@/lib/utils";
import type { ChecklistSection } from "@/shared/types";

interface SectionTabBarProps {
  sections: ChecklistSection[];
  activeId: string;
  onChange: (id: string) => void;
}

export function SectionTabBar({ sections, activeId, onChange }: SectionTabBarProps) {
  return (
    <div className="flex overflow-x-auto border-b bg-background sticky top-0 z-10 shrink-0">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onChange(section.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            section.id === activeId
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {section.group?.code ?? section.name}
        </button>
      ))}
    </div>
  );
}
