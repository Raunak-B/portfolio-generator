import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getOwnerPortfolio } from "@/lib/portfolio/queries";
import { createClient } from "@/lib/supabase/server";
import type { DbPortfolio } from "@/types/database";

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

  const { data: profile } = await supabase
    .from("users")
    .select("github_username, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  const portfolioRow = await getOwnerPortfolio(user.id);
  const portfolio = portfolioRow as DbPortfolio | null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardClient
        displayName={profile.display_name ?? profile.github_username}
        githubUsername={profile.github_username}
        avatarUrl={profile.avatar_url}
        portfolio={portfolio}
        siteUrl={siteUrl}
      />
    </div>
  );
}
