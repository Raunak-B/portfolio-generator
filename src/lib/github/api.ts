import {
  GITHUB_API_BASE,
  GITHUB_USER_AGENT,
  REPO_DESCRIPTION_FALLBACK,
  TOP_REPOS_LIMIT,
} from "@/lib/constants";
import type {
  GitHubFetchResult,
  GitHubProfileData,
  GitHubRepository,
  LanguageStat,
  PortfolioRepository,
} from "@/lib/github/types";
import {
  GitHubAuthError,
  GitHubRateLimitError,
} from "@/lib/github/types";

type GitHubFetchOptions = {
  token: string;
};

function parseRateLimitHeaders(response: Response): {
  remaining: number;
  resetAt: string | null;
} {
  const remaining = Number(response.headers.get("x-ratelimit-remaining") ?? "0");
  const resetUnix = response.headers.get("x-ratelimit-reset");
  const resetAt = resetUnix
    ? new Date(Number(resetUnix) * 1000).toISOString()
    : null;
  return { remaining, resetAt };
}

async function githubFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<{ data: T; rateLimit: { remaining: number; resetAt: string | null } }> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": GITHUB_USER_AGENT,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const rateLimit = parseRateLimitHeaders(response);

  if (response.status === 401 || response.status === 403) {
    if (rateLimit.remaining === 0) {
      throw new GitHubRateLimitError(rateLimit.resetAt);
    }
    if (response.status === 401) {
      throw new GitHubAuthError();
    }
  }

  if (response.status === 429) {
    throw new GitHubRateLimitError(rateLimit.resetAt);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as T;
  return { data, rateLimit };
}

function normalizeRepository(repo: GitHubRepository): PortfolioRepository {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description?.trim()
      ? repo.description
      : REPO_DESCRIPTION_FALLBACK,
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language,
  };
}

async function aggregateLanguages(
  repos: GitHubRepository[],
  token: string
): Promise<LanguageStat[]> {
  const nonForkRepos = repos.filter((repo) => !repo.fork).slice(0, TOP_REPOS_LIMIT);
  const languageTotals = new Map<string, number>();

  await Promise.all(
    nonForkRepos.map(async (repo) => {
      try {
        const { data } = await githubFetch<Record<string, number>>(
          `/repos/${repo.full_name}/languages`,
          token
        );
        for (const [language, bytes] of Object.entries(data)) {
          languageTotals.set(
            language,
            (languageTotals.get(language) ?? 0) + bytes
          );
        }
      } catch {
        if (repo.language) {
          languageTotals.set(
            repo.language,
            (languageTotals.get(repo.language) ?? 0) + 1
          );
        }
      }
    })
  );

  const totalBytes = Array.from(languageTotals.values()).reduce(
    (sum, value) => sum + value,
    0
  );

  if (totalBytes === 0) {
    return [];
  }

  return Array.from(languageTotals.entries())
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8);
}

export async function fetchGitHubPortfolioData(
  options: GitHubFetchOptions
): Promise<GitHubFetchResult> {
  const { token } = options;

  if (!token) {
    throw new GitHubAuthError();
  }

  const { data: profile, rateLimit: profileRateLimit } =
    await githubFetch<GitHubProfileData>("/user", token);

  const { data: repos, rateLimit: reposRateLimit } = await githubFetch<
    GitHubRepository[]
  >(
    `/user/repos?sort=stars&direction=desc&per_page=100&type=owner`,
    token
  );

  const topRepositories = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, TOP_REPOS_LIMIT)
    .map(normalizeRepository);

  const languages = await aggregateLanguages(repos, token);

  const remaining = Math.min(
    profileRateLimit.remaining,
    reposRateLimit.remaining
  );

  return {
    profile,
    repositories: topRepositories,
    languages,
    rateLimit: {
      remaining,
      resetAt: profileRateLimit.resetAt ?? reposRateLimit.resetAt,
    },
  };
}
