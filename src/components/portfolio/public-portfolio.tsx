"use client";

import { motion } from "framer-motion";
import { getThemeConfig } from "@/lib/themes";
import type { PublicPortfolio } from "@/types/database";

type PublicPortfolioProps = {
  portfolio: PublicPortfolio;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function PublicPortfolioView({ portfolio }: PublicPortfolioProps) {
  const theme = getThemeConfig(portfolio.theme);
  const displayName =
    portfolio.user.display_name ?? portfolio.user.github_username;
  const bio =
    portfolio.custom_bio?.trim() ||
    portfolio.github_bio?.trim() ||
    "Building software and sharing work on GitHub.";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.header
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center"
        >
          {portfolio.user.avatar_url ? (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={portfolio.user.avatar_url}
              alt={displayName}
              className="mx-auto h-28 w-28 rounded-full border-4 border-white/20 shadow-2xl"
            />
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-4xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={`mt-6 text-4xl font-bold tracking-tight sm:text-5xl ${theme.text}`}>
            {displayName}
          </h1>
          <p className={`mt-2 text-lg ${theme.muted}`}>
            @{portfolio.username}
          </p>
          <p className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${theme.muted}`}>
            {bio}
          </p>
          <a
            href={`https://github.com/${portfolio.user.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${theme.accentMuted} transition hover:opacity-90`}
          >
            View on GitHub →
          </a>
        </motion.header>

        {portfolio.languages.length > 0 ? (
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-14"
          >
            <h2 className={`text-center text-sm font-semibold uppercase tracking-widest ${theme.muted}`}>
              Tech stack
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {portfolio.languages.map((lang) => (
                <span
                  key={lang.name}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${theme.accentMuted}`}
                >
                  {lang.name}
                  <span className="ml-1 opacity-70">({lang.percentage}%)</span>
                </span>
              ))}
            </div>
          </motion.section>
        ) : null}

        <motion.section
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-14"
        >
          <h2 className={`text-center text-sm font-semibold uppercase tracking-widest ${theme.muted}`}>
            Featured repositories
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {portfolio.top_repositories.map((repo, index) => (
              <motion.article
                key={repo.id}
                custom={index + 3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className={`rounded-2xl border p-5 backdrop-blur-sm ${theme.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-lg font-semibold hover:underline ${theme.text}`}
                  >
                    {repo.name}
                  </a>
                  <span className={`shrink-0 text-sm ${theme.muted}`}>
                    ★ {repo.stars}
                  </span>
                </div>
                <p className={`mt-2 text-sm leading-relaxed ${theme.muted}`}>
                  {repo.description}
                </p>
                {repo.language ? (
                  <span
                    className={`mt-4 inline-block h-2 w-2 rounded-full ${theme.accent}`}
                    title={repo.language}
                  />
                ) : null}
                {repo.language ? (
                  <span className={`ml-2 text-xs ${theme.muted}`}>{repo.language}</span>
                ) : null}
              </motion.article>
            ))}
          </div>
        </motion.section>

        <footer className={`mt-16 text-center text-xs ${theme.muted}`}>
          Portfolio generated with Portfolio Generator
        </footer>
      </div>
    </div>
  );
}
