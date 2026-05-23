import { parseResumeWithGemini } from "@/lib/resume/providers/gemini";
import { parseResumeWithHeuristics } from "@/lib/resume/providers/heuristic";
import { parseResumeWithOllama } from "@/lib/resume/providers/ollama";
import { parseResumeWithOpenAI } from "@/lib/resume/providers/openai";
import { ResumeParseError } from "@/lib/resume/validate-parsed";
import type { ParsedResumePortfolio } from "@/types/portfolio";

export type ResumeParserProvider =
  | "heuristic"
  | "gemini"
  | "ollama"
  | "openai";

export { ResumeParseError };

function getProvider(): ResumeParserProvider {
  const configured = process.env.RESUME_PARSER_PROVIDER?.toLowerCase();

  if (
    configured === "heuristic" ||
    configured === "gemini" ||
    configured === "ollama" ||
    configured === "openai"
  ) {
    return configured;
  }

  // Default: unlimited free parsing on Vercel (no API keys or quotas).
  return "heuristic";
}

export async function parseResumeText(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const provider = getProvider();

  switch (provider) {
    case "heuristic":
      return parseResumeWithHeuristics(resumeText);
    case "gemini":
      return parseResumeWithGemini(resumeText);
    case "ollama":
      return parseResumeWithOllama(resumeText);
    case "openai":
      return parseResumeWithOpenAI(resumeText);
    default:
      throw new ResumeParseError(`Unknown resume parser provider: ${provider}`);
  }
}
