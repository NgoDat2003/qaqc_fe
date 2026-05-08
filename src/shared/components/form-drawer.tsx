import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const WIDTH_CLASSES = {
  default: "sm:max-w-[450px]",
  wide: "sm:max-w-[640px]",
} as const;

export interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  width?: keyof typeof WIDTH_CLASSES;
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  onSubmit,
  isLoading = false,
  submitLabel = "Lưu",
  cancelLabel = "Hủy",
  children,
  side = "right",
  width = "default",
}: FormDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return;
        onOpenChange(next);
      }}
    >
      <SheetContent
        side={side}
        showCloseButton={false}
        className={cn("flex flex-col gap-0 p-0", WIDTH_CLASSES[width])}
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle>{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4">{children}</div>
        </ScrollArea>

        <SheetFooter className="border-t bg-muted/30 p-4">
          <SheetClose
            render={
              <Button variant="outline" disabled={isLoading} />
            }
          >
            {cancelLabel}
          </SheetClose>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
