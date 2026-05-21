import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDelta } from '../utils';

export function DeltaText({ value }: { value?: number }) {
  if (value === undefined || value === 0) return null;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        value > 0 ? "text-success" : "text-danger",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatDelta(value)}
    </span>
  );
}
