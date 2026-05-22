import Link from "next/link";
import { LoginButton } from "@/components/login/login-button";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo ?? "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <Link
          href="/"
          className="text-sm text-slate-500 transition hover:text-slate-300"
        >
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Connect your GitHub account to generate a portfolio from your repos
          and contribution data.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            Authentication failed. Please try again.
          </p>
        ) : null}

        <div className="mt-8">
          <LoginButton redirectTo={redirectTo} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          We request read access to your public GitHub profile and repositories.
        </p>
      </div>
    </div>
  );
}
