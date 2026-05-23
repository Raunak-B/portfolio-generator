import { parseResumeWithGemini } from "@/lib/resume/providers/gemini";
import { parseResumeWithOllama } from "@/lib/resume/providers/ollama";
import { parseResumeWithOpenAI } from "@/lib/resume/providers/openai";
import { ResumeParseError } from "@/lib/resume/validate-parsed";
import type { ParsedResumePortfolio } from "@/types/portfolio";

export type ResumeParserProvider = "gemini" | "ollama" | "openai";

export { ResumeParseError };

function getProvider(): ResumeParserProvider {
  const configured = process.env.RESUME_PARSER_PROVIDER?.toLowerCase();

  if (configured === "gemini" || configured === "ollama" || configured === "openai") {
    return configured;
  }

  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "ollama";
}

export async function parseResumeText(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const provider = getProvider();

  switch (provider) {
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
