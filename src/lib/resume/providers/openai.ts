import OpenAI from "openai";
import { RESUME_PARSER_SYSTEM_PROMPT } from "@/lib/resume/prompt";
import { ResumeParseError, validateParsedResumeJson } from "@/lib/resume/validate-parsed";
import type { ParsedResumePortfolio } from "@/types/portfolio";

export async function parseResumeWithOpenAI(
  resumeText: string
): Promise<ParsedResumePortfolio> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new ResumeParseError(
      "OPENAI_API_KEY is not configured on the server."
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4-turbo",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: RESUME_PARSER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Parse this resume into the required JSON schema:\n\n${resumeText.slice(0, 120000)}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!rawContent) {
      throw new ResumeParseError("OpenAI returned an empty response.");
    }

    return validateParsedResumeJson(rawContent);
  } catch (error) {
    if (error instanceof ResumeParseError) {
      throw error;
    }

    throw new ResumeParseError(
      error instanceof Error
        ? `OpenAI request failed: ${error.message}`
        : "OpenAI request failed."
    );
  }
}
