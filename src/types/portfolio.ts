export type ProcessingStatus = "idle" | "processing" | "completed" | "failed";

export type ExperienceEntry = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

export type ProjectEntry = {
  title: string;
  description: string;
  link: string | null;
};

export type ParsedResumePortfolio = {
  hero_title: string;
  bio: string;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  contact_email: string | null;
  suggested_username?: string;
};

export type PublicResumePortfolio = {
  id: string;
  user_id: string;
  username: string;
  hero_title: string | null;
  bio: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  contact_email: string | null;
  processing_status: ProcessingStatus;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
};

export type OwnerResumePortfolio = PublicResumePortfolio & {
  resume_storage_path: string | null;
};
