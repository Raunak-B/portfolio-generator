"use server";

import { fetchGitHubPortfolioData } from "@/lib/github/api";
import {
  GitHubAuthError,
  GitHubRateLimitError,
  type GitHubFetchResult,
} from "@/lib/github/types";
import { createClient } from "@/lib/supabase/server";

export type GitHubActionResult =
  | { success: true; data: GitHubFetchResult }
  | {
      success: false;
      error: string;
      code: "rate_limit" | "auth" | "unknown";
      resetAt?: string | null;
    };

export async function fetchGitHubDataAction(): Promise<GitHubActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "You must be signed in to fetch GitHub data.",
      code: "auth",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const providerToken = session?.provider_token;

  if (!providerToken) {
    return {
      success: false,
      error:
        "GitHub access token not found. Sign out and sign in again with GitHub.",
      code: "auth",
    };
  }

  try {
    const data = await fetchGitHubPortfolioData({ token: providerToken });
    return { success: true, data };
  } catch (error) {
    if (error instanceof GitHubRateLimitError) {
      return {
        success: false,
        error: error.message,
        code: "rate_limit",
        resetAt: error.resetAt,
      };
    }

    if (error instanceof GitHubAuthError) {
      return {
        success: false,
        error: error.message,
        code: "auth",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch GitHub data.",
      code: "unknown",
    };
  }
}
