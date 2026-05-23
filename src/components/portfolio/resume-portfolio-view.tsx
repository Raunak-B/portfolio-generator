import { CreatorFooter } from "@/components/portfolio/creator-footer";
import type { PublicResumePortfolio } from "@/types/portfolio";

type ResumePortfolioViewProps = {
  portfolio: PublicResumePortfolio;
};

export function ResumePortfolioView({ portfolio }: ResumePortfolioViewProps) {
  const displayName =
    portfolio.hero_title?.split("|")[0]?.trim() ??
    portfolio.hero_title ??
    portfolio.username;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-slate-800 pb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Portfolio
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {displayName}
          </h1>
          {portfolio.hero_title ? (
            <p className="mt-3 text-xl text-cyan-300/90">{portfolio.hero_title}</p>
          ) : null}
          {portfolio.bio ? (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
              {portfolio.bio}
            </p>
          ) : null}
        </section>

        {portfolio.experience.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Experience
            </h2>
            <div className="mt-6 space-y-6">
              {portfolio.experience.map((entry, index) => (
                <article
                  key={`${entry.company}-${entry.role}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {entry.role}
                    </h3>
                    <span className="text-sm text-cyan-400/90">
                      {entry.duration}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-slate-300">
                    {entry.company}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {entry.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {portfolio.projects.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Projects
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {portfolio.projects.map((project, index) => (
                <article
                  key={`${project.title}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400"
                      >
                        {project.title} →
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {project.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {portfolio.skills.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Skills
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-sm text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14 rounded-2xl border border-slate-800 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-8 text-center">
          <h2 className="text-lg font-semibold text-white">Get in touch</h2>
          {portfolio.contact_email ? (
            <a
              href={`mailto:${portfolio.contact_email}`}
              className="mt-4 inline-block text-lg text-cyan-400 underline hover:text-cyan-300"
            >
              {portfolio.contact_email}
            </a>
          ) : (
            <p className="mt-4 text-slate-400">Contact email not provided.</p>
          )}
        </section>
      </main>

      <CreatorFooter />
    </div>
  );
}
