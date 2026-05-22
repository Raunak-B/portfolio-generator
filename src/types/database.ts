import type { PortfolioTheme } from "@/lib/constants";
import type { LanguageStat, PortfolioRepository } from "@/lib/github/types";

export type DbUser = {
  id: string;
  github_username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPortfolio = {
  id: string;
  user_id: string;
  username: string;
  custom_bio: string | null;
  theme: PortfolioTheme;
  github_bio: string | null;
  top_repositories: PortfolioRepository[];
  languages: LanguageStat[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicPortfolio = DbPortfolio & {
  user: Pick<DbUser, "display_name" | "avatar_url" | "github_username">;
};
