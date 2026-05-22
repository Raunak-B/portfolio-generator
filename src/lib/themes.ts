import type { PortfolioTheme } from "@/lib/constants";

export type ThemeConfig = {
  name: string;
  gradient: string;
  accent: string;
  accentMuted: string;
  card: string;
  text: string;
  muted: string;
};

export const THEME_CONFIG: Record<PortfolioTheme, ThemeConfig> = {
  slate: {
    name: "Slate",
    gradient: "from-slate-900 via-slate-800 to-slate-950",
    accent: "bg-slate-500",
    accentMuted: "bg-slate-500/20 text-slate-300",
    card: "bg-slate-800/60 border-slate-700/50",
    text: "text-white",
    muted: "text-slate-400",
  },
  ocean: {
    name: "Ocean",
    gradient: "from-cyan-900 via-blue-900 to-slate-950",
    accent: "bg-cyan-500",
    accentMuted: "bg-cyan-500/20 text-cyan-300",
    card: "bg-blue-900/40 border-cyan-800/50",
    text: "text-white",
    muted: "text-cyan-200/70",
  },
  violet: {
    name: "Violet",
    gradient: "from-violet-900 via-purple-900 to-slate-950",
    accent: "bg-violet-500",
    accentMuted: "bg-violet-500/20 text-violet-300",
    card: "bg-violet-900/40 border-violet-700/50",
    text: "text-white",
    muted: "text-violet-200/70",
  },
  emerald: {
    name: "Emerald",
    gradient: "from-emerald-900 via-teal-900 to-slate-950",
    accent: "bg-emerald-500",
    accentMuted: "bg-emerald-500/20 text-emerald-300",
    card: "bg-emerald-900/40 border-emerald-700/50",
    text: "text-white",
    muted: "text-emerald-200/70",
  },
  rose: {
    name: "Rose",
    gradient: "from-rose-900 via-pink-900 to-slate-950",
    accent: "bg-rose-500",
    accentMuted: "bg-rose-500/20 text-rose-300",
    card: "bg-rose-900/40 border-rose-700/50",
    text: "text-white",
    muted: "text-rose-200/70",
  },
  amber: {
    name: "Amber",
    gradient: "from-amber-900 via-orange-900 to-slate-950",
    accent: "bg-amber-500",
    accentMuted: "bg-amber-500/20 text-amber-300",
    card: "bg-amber-900/40 border-amber-700/50",
    text: "text-white",
    muted: "text-amber-200/70",
  },
};

export function getThemeConfig(theme: string): ThemeConfig {
  if (theme in THEME_CONFIG) {
    return THEME_CONFIG[theme as PortfolioTheme];
  }
  return THEME_CONFIG.slate;
}
