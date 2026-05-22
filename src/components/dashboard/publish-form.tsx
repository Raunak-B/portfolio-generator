"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { publishPortfolioAction } from "@/actions/portfolio";
import {
  PORTFOLIO_THEMES,
  type PortfolioTheme,
} from "@/lib/constants";
import type { GitHubFetchResult } from "@/lib/github/types";
import { THEME_CONFIG } from "@/lib/themes";

type PublishFormProps = {
  initialBio: string;
  initialTheme: PortfolioTheme;
  githubData: GitHubFetchResult | null;
  isPublished: boolean;
  portfolioUrl: string;
};

export function PublishForm({
  initialBio,
  initialTheme,
  githubData,
  isPublished,
  portfolioUrl,
}: PublishFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customBio, setCustomBio] = useState(initialBio);
  const [theme, setTheme] = useState<PortfolioTheme>(initialTheme);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handlePublish() {
    if (!githubData) {
      setError("Fetch GitHub data before publishing.");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await publishPortfolioAction({
        customBio,
        theme,
        githubBio: githubData.profile.bio,
        repositories: githubData.repositories,
        languages: githubData.languages,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(`Portfolio published at /${result.username}`);
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Customize & Publish</h2>
      <p className="mt-1 text-sm text-slate-400">
        Edit your bio, pick a theme, then publish your public portfolio.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="customBio"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Custom bio
          </label>
          <textarea
            id="customBio"
            rows={4}
            value={customBio}
            onChange={(event) => setCustomBio(event.target.value)}
            placeholder="Tell visitors about yourself, your stack, and what you're building…"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Color theme</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PORTFOLIO_THEMES.map((themeKey) => {
              const config = THEME_CONFIG[themeKey];
              const selected = theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setTheme(themeKey)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-500"
                  }`}
                >
                  <span
                    className={`mb-2 inline-block h-3 w-3 rounded-full ${config.accent}`}
                  />
                  <span className="block text-sm font-medium text-white">
                    {config.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isPublished ? (
          <p className="text-sm text-emerald-400">
            Live portfolio:{" "}
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {portfolioUrl}
            </a>
          </p>
        ) : null}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending || !githubData}
          className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Publishing…" : isPublished ? "Update Portfolio" : "Publish Portfolio"}
        </button>
      </div>
    </section>
  );
}
