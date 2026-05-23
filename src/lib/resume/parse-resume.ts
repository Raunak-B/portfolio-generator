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
  const configured = process.env.RESUME_PARSER_PROVIDER?.toLowerCase().trim();

  if (
    configured === "heuristic" ||
    configured === "gemini" ||
    configured === "ollama" ||
    configured === "openai"
  ) {
    return configured;
  }

  return "heuristic";
}

function shouldFallbackToHeuristic(error: unknown): boolean {
  if (!(error instanceof ResumeParseError)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted")
  );
}

async function runProvider(
  provider: ResumeParserProvider,
  resumeText: string
): Promise<ParsedResumePortfolio> {
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

export async function parseResumeText(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const provider = getProvider();

  if (provider === "heuristic") {
    return parseResumeWithHeuristics(resumeText);
  }

  try {
    return await runProvider(provider, resumeText);
  } catch (error) {
    if (shouldFallbackToHeuristic(error)) {
      return parseResumeWithHeuristics(resumeText);
    }
    throw error;
  }
}
