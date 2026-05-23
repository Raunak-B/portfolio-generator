import Link from "next/link";
import { AuthForm } from "@/components/login/auth-form";

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
        <h1 className="mt-6 text-2xl font-bold text-white">
          {params.error ? "Sign in again" : "Welcome"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Upload your resume and get a permanent portfolio at{" "}
          <code className="text-cyan-300">/p/username</code>.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            Authentication failed. Please try again.
          </p>
        ) : null}

        <AuthForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
