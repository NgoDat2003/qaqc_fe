"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  width?: string; // e.g., "40%"
}

export function SideDrawer({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  className,
  width = "40%",
}: SideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={cn(
          "w-full p-0 flex flex-col border-l border-gray-100 shadow-2xl transition-all duration-300 ease-in-out",
          className
        )}
        style={{ maxWidth: "100%", width: typeof window !== 'undefined' && window.innerWidth < 1024 ? "100%" : width }}
      >
        {/* Header Section */}
        <SheetHeader className="p-8 border-b bg-white relative overflow-hidden shrink-0">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex gap-5 items-start">
            {icon && (
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 text-white">
                {icon}
              </div>
            )}
            <div className="space-y-1 pt-1">
              <SheetTitle className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-sm font-medium text-gray-500 leading-relaxed max-w-md">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-6 top-6 rounded-xl h-10 w-10 hover:bg-gray-100 text-gray-400 transition-all active:scale-90"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden bg-gray-50/30">
          <ScrollArea className="h-full">
            <div className="p-8 pb-32">
              {children}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Section */}
        {footer && (
          <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-8px_30px_rgb(0,0,0,0.03)] backdrop-blur-sm bg-white/90">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function DrawerSection({ title, children, icon: SectionIcon, className }: { title: string; children: React.ReactNode; icon?: any; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2.5 pb-1">
        {SectionIcon && (
          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <SectionIcon className="h-4 w-4" />
          </div>
        )}
        <h4 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">{title}</h4>
        <div className="h-[1px] flex-1 bg-gray-100 ml-2" />
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}

export function DrawerInfoBox({ children, icon: InfoIcon = true }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 mb-8 shadow-sm">
      {InfoIcon && (
        <div className="shrink-0 mt-0.5">
          {typeof InfoIcon === 'boolean' ? (
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : <InfoIcon className="h-4 w-4 text-amber-500" />}
        </div>
      )}
      <p className="text-xs font-semibold text-amber-700 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
