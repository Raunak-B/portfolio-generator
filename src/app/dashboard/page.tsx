import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getOwnerPortfolio } from "@/lib/portfolio/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | Portfolio Generator",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const portfolio = await getOwnerPortfolio(user.id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardClient
        userId={user.id}
        email={user.email ?? "Signed in user"}
        portfolio={portfolio}
        siteUrl={siteUrl}
      />
    </div>
  );
}
