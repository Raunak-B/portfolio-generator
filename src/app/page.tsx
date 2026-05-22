import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          Dynamic Portfolio Generator
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Turn your GitHub profile into a{" "}
          <span className="text-cyan-400">stunning portfolio</span> in minutes.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          Sign in with GitHub, pull your top repositories and languages, customize
          your bio and theme, and publish a public page at{" "}
          <code className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">
            yourdomain.com/username
          </code>
          .
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Get started with GitHub
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm text-slate-300 transition hover:border-slate-500"
          >
            Sign in
          </Link>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "GitHub OAuth",
              body: "Secure login via Supabase Auth with your GitHub identity.",
            },
            {
              title: "Auto-sync repos",
              body: "Top 6 starred repos and primary languages fetched via REST API.",
            },
            {
              title: "Public portfolios",
              body: "RLS-backed multi-tenant pages readable by anyone when published.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <h2 className="font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
