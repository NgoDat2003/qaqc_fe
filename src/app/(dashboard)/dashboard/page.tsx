import { redirect } from "next/navigation";

// Redirect /dashboard → /master-data/organization (admin default landing)
export default function DashboardRedirect() {
  redirect("/master-data/organization");
}
