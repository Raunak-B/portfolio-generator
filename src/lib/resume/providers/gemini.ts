import { RESUME_PARSER_SYSTEM_PROMPT } from "@/lib/resume/prompt";
import { ResumeParseError, validateParsedResumeJson } from "@/lib/resume/validate-parsed";
import type { ParsedResumePortfolio } from "@/types/portfolio";

export async function parseResumeWithGemini(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ResumeParseError(
      "GEMINI_API_KEY is not configured. Get a free key at https://aistudio.google.com/apikey"
    );
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: RESUME_PARSER_SYSTEM_PROMPT }],
      },
      contents: [
        {
          parts: [
            {
              text: `Parse this resume into the required JSON schema:\n\n${resumeText.slice(0, 120000)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ResumeParseError(
      `Gemini request failed (${response.status}): ${body.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const rawContent =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  if (!rawContent) {
    throw new ResumeParseError("Gemini returned an empty response.");
  }

  return validateParsedResumeJson(rawContent);
}
