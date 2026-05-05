export default function AuditPlanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Chi Tiết Kế Hoạch</h1>
      <p className="text-muted-foreground mt-2">ID: {params.id}</p>
    </div>
  );
}
