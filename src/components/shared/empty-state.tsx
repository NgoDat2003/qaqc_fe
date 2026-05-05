import { cn } from "@/lib/utils"
import { FolderX } from "lucide-react"

export function EmptyState({ title, description, action, className }: { title: string, description: string, action?: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed bg-muted/20", className)}>
      <FolderX className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}
