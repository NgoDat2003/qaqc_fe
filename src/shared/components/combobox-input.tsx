"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxInputProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  emptyText?: string;
  isLoading?: boolean;
}

export function ComboboxInput({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  className,
  disabled = false,
  emptyText = "Không tìm thấy",
  isLoading = false,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          open && "ring-2 ring-ring/30 border-ring"
        )}
      >
        <span className={cn("truncate text-left flex-1", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span onClick={handleClear} className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập để tìm..."
              className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {isLoading ? (
              <div className="px-3 py-4 text-xs text-center text-muted-foreground">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-center text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                    opt.value === value && "bg-muted font-medium"
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.value === value && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
