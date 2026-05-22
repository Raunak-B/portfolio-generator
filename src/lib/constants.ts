export const GITHUB_API_BASE = "https://api.github.com";

export const GITHUB_USER_AGENT = "portfolio-generator-saas";

/** Max repos to show on the public portfolio */
export const TOP_REPOS_LIMIT = 6;

/** Themes available in the dashboard */
export const PORTFOLIO_THEMES = [
  "slate",
  "ocean",
  "violet",
  "emerald",
  "rose",
  "amber",
] as const;

export type PortfolioTheme = (typeof PORTFOLIO_THEMES)[number];

export const REPO_DESCRIPTION_FALLBACK =
  "No description provided for this repository.";
