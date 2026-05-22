export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
};

export type PortfolioRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
};

export type LanguageStat = {
  name: string;
  bytes: number;
  percentage: number;
};

export type GitHubProfileData = {
  bio: string | null;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
};

export type GitHubFetchResult = {
  profile: GitHubProfileData;
  repositories: PortfolioRepository[];
  languages: LanguageStat[];
  rateLimit: {
    remaining: number;
    resetAt: string | null;
  };
};

export class GitHubRateLimitError extends Error {
  resetAt: string | null;

  constructor(resetAt: string | null) {
    super("GitHub API rate limit exceeded. Try again after the reset time.");
    this.name = "GitHubRateLimitError";
    this.resetAt = resetAt;
  }
}

export class GitHubAuthError extends Error {
  constructor(message = "GitHub token is missing or invalid.") {
    super(message);
    this.name = "GitHubAuthError";
  }
}
