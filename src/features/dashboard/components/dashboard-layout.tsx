import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '../constants';

export function DashboardPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <CardHeader className="space-y-1 border-b border-border/70 bg-muted/15 pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

export function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex min-h-[132px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 px-4 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONE_CLASSES;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/25 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold",
          TONE_CLASSES[tone].split(" ")[1],
        )}
      >
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
