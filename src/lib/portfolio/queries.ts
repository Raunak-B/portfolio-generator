import { createClient } from "@/lib/supabase/server";
import type {
  ExperienceEntry,
  OwnerResumePortfolio,
  ProcessingStatus,
  ProjectEntry,
  PublicResumePortfolio,
} from "@/types/portfolio";

function parseExperience(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];
  return value as ExperienceEntry[];
}

function parseProjects(value: unknown): ProjectEntry[] {
  if (!Array.isArray(value)) return [];
  return value as ProjectEntry[];
}

function mapPortfolioRow(row: {
  id: string;
  user_id: string;
  username: string;
  hero_title: string | null;
  bio: string | null;
  skills: string[] | null;
  experience: unknown;
  projects: unknown;
  contact_email: string | null;
  processing_status: string;
  processing_error: string | null;
  resume_storage_path?: string | null;
  created_at: string;
  updated_at: string;
}): PublicResumePortfolio {
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    hero_title: row.hero_title,
    bio: row.bio,
    skills: row.skills ?? [],
    experience: parseExperience(row.experience),
    projects: parseProjects(row.projects),
    contact_email: row.contact_email,
    processing_status: row.processing_status as ProcessingStatus,
    processing_error: row.processing_error,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getPublishedPortfolioByUsername(
  username: string
): Promise<PublicResumePortfolio | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select(
      "id, user_id, username, hero_title, bio, skills, experience, projects, contact_email, processing_status, processing_error, created_at, updated_at"
    )
    .eq("username", username.toLowerCase())
    .eq("processing_status", "completed")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPortfolioRow(data);
}

export async function getOwnerPortfolio(
  userId: string
): Promise<OwnerResumePortfolio | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    ...mapPortfolioRow(data),
    resume_storage_path: data.resume_storage_path,
  };
}
