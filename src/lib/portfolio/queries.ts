import type { PortfolioTheme } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { LanguageStat, PortfolioRepository } from "@/lib/github/types";
import type { DbPortfolio, PublicPortfolio } from "@/types/database";

function parseRepositories(value: unknown): PortfolioRepository[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as PortfolioRepository[];
}

function parseLanguages(value: unknown): LanguageStat[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as LanguageStat[];
}

function toDbPortfolio(row: {
  id: string;
  user_id: string;
  username: string;
  custom_bio: string | null;
  theme: string;
  github_bio: string | null;
  top_repositories: unknown;
  languages: unknown;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}): DbPortfolio {
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    custom_bio: row.custom_bio,
    theme: row.theme as PortfolioTheme,
    github_bio: row.github_bio,
    top_repositories: parseRepositories(row.top_repositories),
    languages: parseLanguages(row.languages),
    is_published: row.is_published,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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

  if (!user) {
    return null;
  }

  const base = toDbPortfolio(portfolio);

  return {
    ...base,
    user: {
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      github_username: user.github_username,
    },
  };
}

export async function getOwnerPortfolio(
  userId: string
): Promise<DbPortfolio | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toDbPortfolio(data);
}
