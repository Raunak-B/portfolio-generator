import { createClient } from "@/lib/supabase/server";
import type { PublicPortfolio } from "@/types/database";

export async function getPublishedPortfolioByUsername(
  username: string
): Promise<PublicPortfolio | null> {
  const supabase = await createClient();

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select(
      `
      id,
      user_id,
      username,
      custom_bio,
      theme,
      github_bio,
      top_repositories,
      languages,
      is_published,
      published_at,
      created_at,
      updated_at,
      users!inner (
        display_name,
        avatar_url,
        github_username
      )
    `
    )
    .eq("username", username.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();

  if (error || !portfolio) {
    return null;
  }

  const user = Array.isArray(portfolio.users)
    ? portfolio.users[0]
    : portfolio.users;

  return {
    id: portfolio.id,
    user_id: portfolio.user_id,
    username: portfolio.username,
    custom_bio: portfolio.custom_bio,
    theme: portfolio.theme,
    github_bio: portfolio.github_bio,
    top_repositories: portfolio.top_repositories,
    languages: portfolio.languages,
    is_published: portfolio.is_published,
    published_at: portfolio.published_at,
    created_at: portfolio.created_at,
    updated_at: portfolio.updated_at,
    user: {
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      github_username: user.github_username,
    },
  };
}

export async function getOwnerPortfolio(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
