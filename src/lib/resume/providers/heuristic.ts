import { slugifyUsername } from "@/lib/resume/slug";
import type {
  ExperienceEntry,
  ParsedResumePortfolio,
  ProjectEntry,
} from "@/types/portfolio";

const SECTION_HEADERS =
  /^(experience|work experience|employment|professional experience|projects|personal projects|skills|technical skills|core competencies|education|summary|about|profile|contact)\s*:?\s*$/i;

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL_REGEX = /https?:\/\/[^\s)>\]]+/gi;

const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Vue",
  "Angular",
  "HTML",
  "CSS",
  "Tailwind",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Supabase",
  "Firebase",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "Linux",
  "Figma",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
];

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractEmail(text: string): string | null {
  return text.match(EMAIL_REGEX)?.[0] ?? null;
}

function extractName(lines: string[], email: string | null): string {
  const firstLine = lines[0] ?? "Professional";
  if (firstLine.length > 60) {
    return email?.split("@")[0]?.replace(/[._]/g, " ") ?? "Professional";
  }
  return firstLine.replace(/[|•–-].*$/, "").trim() || "Professional";
}

function parseSections(lines: string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current = "header";
  sections.set(current, []);

  for (const line of lines) {
    if (SECTION_HEADERS.test(line)) {
      current = line.replace(/[:\s]+$/i, "").toLowerCase();
      if (!sections.has(current)) {
        sections.set(current, []);
      }
      continue;
    }
    sections.get(current)?.push(line);
  }

  return sections;
}

function detectSkills(text: string, sectionLines: string[]): string[] {
  const found = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.+]/g, "\\$&")}\\b`, "i");
    if (pattern.test(text)) {
      found.add(skill);
    }
  }

  const skillsBlock = sectionLines.join(" ");
  const commaSplit = skillsBlock.split(/[,|•·]/).map((s) => s.trim());
  for (const item of commaSplit) {
    if (item.length >= 2 && item.length <= 40) {
      found.add(
        item
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      );
    }
  }

  return Array.from(found).slice(0, 24);
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const chunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const looksLikeTitle =
      /^[A-Z]/.test(line) &&
      line.length < 80 &&
      !line.startsWith("•") &&
      !line.startsWith("-");

    if (looksLikeTitle && current.length > 0) {
      chunks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  for (const chunk of chunks.slice(0, 8)) {
    if (chunk.length === 0) continue;

    const role = chunk[0];
    const company =
      chunk.find((l) => l.includes(" at "))?.split(" at ")[1] ??
      chunk[1] ??
      "Company";
    const duration =
      chunk.find((l) =>
        /\d{4}|present|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(l)
      ) ?? "Duration not specified";
    const description = chunk
      .slice(2)
      .join(" ")
      .replace(/^[-•]\s*/gm, "")
      .trim();

    entries.push({
      role: role.slice(0, 120),
      company: company.slice(0, 120),
      duration: duration.slice(0, 80),
      description:
        description ||
        "Contributed to product delivery, collaboration, and technical execution.",
    });
  }

  return entries;
}

function parseProjects(lines: string[]): ProjectEntry[] {
  const projects: ProjectEntry[] = [];

  for (const line of lines.slice(0, 12)) {
    const urls = line.match(URL_REGEX) ?? [];
    const title = line.replace(URL_REGEX, "").replace(/^[-•]\s*/, "").trim();

    if (title.length < 3) continue;

    projects.push({
      title: title.slice(0, 100),
      description:
        "Project described in resume. See repository link for implementation details.",
      link: urls[0] ?? null,
    });
  }

  return projects.slice(0, 8);
}

function buildBio(
  headerLines: string[],
  summaryLines: string[],
  name: string
): string {
  const summary = summaryLines.join(" ").trim();
  if (summary.length > 40) {
    return summary.slice(0, 600);
  }

  const paragraph = headerLines.slice(1, 5).join(" ").trim();
  if (paragraph.length > 40) {
    return paragraph.slice(0, 600);
  }

  return `${name} is a motivated professional with experience across software, problem-solving, and cross-functional collaboration. This portfolio was generated from their uploaded resume.`;
}

export function parseResumeWithHeuristics(
  resumeText: string
): ParsedResumePortfolio {
  const lines = normalizeLines(resumeText);
  const sections = parseSections(lines);
  const fullText = resumeText;

  const email = extractEmail(fullText);
  const name = extractName(lines, email);

  const summaryLines =
    sections.get("summary") ??
    sections.get("about") ??
    sections.get("profile") ??
    [];
  const experienceLines =
    sections.get("experience") ??
    sections.get("work experience") ??
    sections.get("employment") ??
  sections.get("professional experience") ??
    [];
  const projectLines =
    sections.get("projects") ?? sections.get("personal projects") ?? [];
  const skillsLines =
    sections.get("skills") ??
    sections.get("technical skills") ??
    sections.get("core competencies") ??
    [];

  const headerLines = sections.get("header") ?? lines.slice(0, 8);

  let skills = detectSkills(fullText, skillsLines);
  if (skills.length < 3) {
    skills = ["Communication", "Problem Solving", "Team Collaboration", ...skills];
  }

  let experience = parseExperience(experienceLines);
  if (experience.length === 0 && lines.length > 6) {
    experience = parseExperience(lines.slice(4, 20));
  }

  let projects = parseProjects(projectLines);
  if (projects.length === 0) {
    const withUrls = lines.filter((l) => URL_REGEX.test(l));
    projects = parseProjects(withUrls);
  }

  const bio = buildBio(headerLines, summaryLines, name);
  const heroTitle = `${name} | Professional Portfolio`;

  return {
    hero_title: heroTitle,
    bio,
    skills: skills.slice(0, 20),
    experience: experience.slice(0, 6),
    projects: projects.slice(0, 6),
    contact_email: email,
    suggested_username: slugifyUsername(name || email?.split("@")[0] || "portfolio"),
  };
}
