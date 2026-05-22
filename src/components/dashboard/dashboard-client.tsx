"use client";

import { useState, useTransition } from "react";
import { fetchGitHubDataAction } from "@/actions/github";
import { signOutAction } from "@/actions/portfolio";
import { PublishForm } from "@/components/dashboard/publish-form";
import type { PortfolioTheme } from "@/lib/constants";
import type { GitHubFetchResult } from "@/lib/github/types";
import type { DbPortfolio } from "@/types/database";

type DashboardClientProps = {
  displayName: string;
  githubUsername: string;
  avatarUrl: string | null;
  portfolio: DbPortfolio | null;
  siteUrl: string;
};

export function DashboardClient({
  displayName,
  githubUsername,
  avatarUrl,
  portfolio,
  siteUrl,
}: DashboardClientProps) {
  const [isFetching, startFetch] = useTransition();
  const [isSigningOut, startSignOut] = useTransition();
  const [githubData, setGithubData] = useState<GitHubFetchResult | null>(
    portfolio
      ? {
          profile: {
            bio: portfolio.github_bio,
            login: githubUsername,
            name: displayName,
            avatar_url: avatarUrl ?? "",
            html_url: `https://github.com/${githubUsername}`,
            public_repos: portfolio.top_repositories.length,
            followers: 0,
          },
          repositories: portfolio.top_repositories,
          languages: portfolio.languages,
          rateLimit: { remaining: -1, resetAt: null },
        }
      : null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rateLimitReset, setRateLimitReset] = useState<string | null>(null);

  function handleFetchGitHub() {
    setFetchError(null);
    setRateLimitReset(null);

    startFetch(async () => {
      const result = await fetchGitHubDataAction();

      if (!result.success) {
        setFetchError(result.error);
        if (result.code === "rate_limit" && result.resetAt) {
          setRateLimitReset(result.resetAt);
        }
        return;
      }

      setGithubData(result.data);
    });
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOutAction();
    });
  }

  const portfolioUrl = `${siteUrl}/${githubUsername}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full border-2 border-slate-700"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-slate-400">@{githubUsername}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleFetchGitHub}
            disabled={isFetching}
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50"
          >
            {isFetching ? "Fetching from GitHub…" : "Refresh GitHub Data"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-400 transition hover:border-rose-500/50 hover:text-rose-300"
          >
            Sign out
          </button>
        </div>
      </header>

      {fetchError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {fetchError}
          {rateLimitReset ? (
            <span className="mt-1 block text-rose-300/80">
              Rate limit resets at{" "}
              {new Date(rateLimitReset).toLocaleString()}.
            </span>
          ) : null}
        </div>
      ) : null}

      {githubData && githubData.rateLimit.remaining >= 0 ? (
        <p className="mb-6 text-xs text-slate-500">
          GitHub API requests remaining: {githubData.rateLimit.remaining}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <GitHubPreview data={githubData} />
        <PublishForm
          initialBio={portfolio?.custom_bio ?? githubData?.profile.bio ?? ""}
          initialTheme={(portfolio?.theme as PortfolioTheme) ?? "slate"}
          githubData={githubData}
          isPublished={portfolio?.is_published ?? false}
          portfolioUrl={portfolioUrl}
        />
      </div>
    </div>
  );
}

function GitHubPreview({ data }: { data: GitHubFetchResult | null }) {
  if (!data) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
        <p className="text-slate-400">
          Click &quot;Refresh GitHub Data&quot; to load your bio, top repositories,
          and languages.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">GitHub Preview</h2>
      <p className="mt-2 text-sm text-slate-400">
        {data.profile.bio ?? "No GitHub bio set."}
      </p>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Top repositories
      </h3>
      <ul className="mt-3 space-y-3">
        {data.repositories.map((repo) => (
          <li
            key={repo.id}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-cyan-400 hover:underline"
              >
                {repo.name}
              </a>
              <span className="shrink-0 text-xs text-amber-400">
                ★ {repo.stars}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{repo.description}</p>
            {repo.language ? (
              <span className="mt-2 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {repo.language}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Primary languages
      </h3>
      {data.languages.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.languages.map((lang) => (
            <span
              key={lang.name}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
            >
              {lang.name} ({lang.percentage}%)
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No language data available.</p>
      )}
    </section>
  );
}
