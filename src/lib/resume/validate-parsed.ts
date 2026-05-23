import { z } from "zod";
import type { ParsedResumePortfolio } from "@/types/portfolio";

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  duration: z.string().min(1),
  description: z.string().min(1),
});

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
});

const parsedResumeSchema = z.object({
  hero_title: z.string().min(1),
  bio: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  contact_email: z
    .string()
    .email()
    .nullable()
    .or(z.literal(""))
    .transform((value) => value || null),
  suggested_username: z.string().optional(),
});

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

export function validateParsedResumeJson(rawContent: string): ParsedResumePortfolio {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawContent);
  } catch {
    throw new ResumeParseError(
      "The AI returned invalid JSON. Please try uploading again."
    );
  }

  const validated = parsedResumeSchema.safeParse(parsedJson);

  if (!validated.success) {
    throw new ResumeParseError(
      `AI JSON did not match the portfolio schema: ${validated.error.issues[0]?.message ?? "validation failed"}`
    );
  }

  return validated.data;
}
