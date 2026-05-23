export function CreatorFooter() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/90 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 px-4 text-center sm:flex-row sm:gap-6">
        <p className="text-sm text-slate-400">
          Platform engineered by{" "}
          <span className="font-medium text-slate-200">Raunak Bhattacharjee</span>
          {" | "}
          NIT Silchar
        </p>
        <div className="flex gap-4 text-sm">
          <a
            href="https://github.com/Raunak-B"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/raunak-bhattacharjee"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
