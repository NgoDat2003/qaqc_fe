import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "error";
}

export function MetricCard({ label, value, tone = "default" }: MetricCardProps) {
  const dotColors: Record<string, string> = {
    default: "bg-gray-300",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-red-400",
  };

  return (
    <Card className="border border-gray-100 shadow-none hover:shadow-sm transition-shadow rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[tone]}`} />
        </div>
      </CardContent>
    </Card>
  );
}
