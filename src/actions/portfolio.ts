"use server";

import { revalidatePath } from "next/cache";
import { PORTFOLIO_THEMES, type PortfolioTheme } from "@/lib/constants";
import type { LanguageStat, PortfolioRepository } from "@/lib/github/types";
import { createClient } from "@/lib/supabase/server";

export type PublishPortfolioInput = {
  customBio: string;
  theme: PortfolioTheme;
  githubBio: string | null;
  repositories: PortfolioRepository[];
  languages: LanguageStat[];
};

export type PublishActionResult =
  | { success: true; username: string }
  | { success: false; error: string };

export async function publishPortfolioAction(
  input: PublishPortfolioInput
): Promise<PublishActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be signed in to publish." };
  }

  if (!PORTFOLIO_THEMES.includes(input.theme)) {
    return { success: false, error: "Invalid theme selected." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("github_username")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "User profile not found. Try signing in again.",
    };
  }

  const { error: updateError } = await supabase
    .from("portfolios")
    .update({
      custom_bio: input.customBio.trim() || null,
      theme: input.theme,
      github_bio: input.githubBio,
      top_repositories: input.repositories,
      languages: input.languages,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to publish portfolio.",
    };
  }

  const username = profile.github_username as string;
  revalidatePath(`/${username}`);
  revalidatePath("/dashboard");

  return { success: true, username };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
