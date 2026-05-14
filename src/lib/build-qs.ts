export function buildQS(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
}
