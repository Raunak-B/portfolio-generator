"use client";

import { useTransition } from "react";
import { signOutAction } from "@/actions/parse-resume";
import { ResumeUpload } from "@/components/dashboard/resume-upload";
import type { OwnerResumePortfolio } from "@/types/portfolio";

type DashboardClientProps = {
  userId: string;
  email: string;
  portfolio: OwnerResumePortfolio | null;
  siteUrl: string;
};

export function DashboardClient({
  userId,
  email,
  portfolio,
  siteUrl,
}: DashboardClientProps) {
  const [isSigningOut, startSignOut] = useTransition();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => startSignOut(() => signOutAction())}
          disabled={isSigningOut}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-white">Upload your resume</h2>
        <p className="mt-1 text-sm text-slate-400">
          We will parse your resume with AI and publish a permanent portfolio at{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">
            /p/your-username
          </code>
          .
        </p>
        <div className="mt-6">
          <ResumeUpload userId={userId} portfolio={portfolio} siteUrl={siteUrl} />
        </div>
      </section>
    </div>
  );
}
