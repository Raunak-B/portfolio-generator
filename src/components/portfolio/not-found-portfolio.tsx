import Link from "next/link";
import { CreatorFooter } from "@/components/portfolio/creator-footer";

type NotFoundPortfolioProps = {
  username: string;
};

export function NotFoundPortfolio({ username }: NotFoundPortfolioProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          Portfolio not found
        </h1>
        <p className="mt-4 max-w-md text-slate-400">
          No portfolio exists at{" "}
          <span className="font-mono text-slate-200">/p/{username}</span>. The
          user may not have uploaded a resume yet, or processing is still in
          progress.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition hover:border-slate-500"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Create your portfolio
          </Link>
        </div>
      </div>
      <CreatorFooter />
    </div>
  );
}
