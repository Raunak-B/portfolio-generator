import { RESUME_PARSER_SYSTEM_PROMPT } from "@/lib/resume/prompt";
import { ResumeParseError, validateParsedResumeJson } from "@/lib/resume/validate-parsed";
import type { ParsedResumePortfolio } from "@/types/portfolio";

export async function parseResumeWithOllama(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: RESUME_PARSER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Parse this resume into the required JSON schema:\n\n${resumeText.slice(0, 120000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ResumeParseError(
      `Ollama request failed (${response.status}). Is Ollama running? ${body.slice(0, 150)}`
    );
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  const rawContent = data.message?.content?.trim() ?? "";

  if (!rawContent) {
    throw new ResumeParseError("Ollama returned an empty response.");
  }

  return validateParsedResumeJson(rawContent);
}
