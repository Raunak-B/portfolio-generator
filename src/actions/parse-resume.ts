"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseResumeText, ResumeParseError } from "@/lib/resume/parse-resume";
import { ensureUniqueUsername, slugifyUsername } from "@/lib/resume/slug";
import {
  extractTextFromPdf,
  extractTextFromPlainFile,
} from "@/lib/resume/pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ParseResumeResult =
  | { success: true; username: string; portfolioUrl: string }
  | { success: false; error: string };

export async function parseResumeAction(input: {
  storagePath: string;
  mimeType: string;
}): Promise<ParseResumeResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be signed in to parse a resume." };
  }

  const folder = input.storagePath.split("/")[0];
  if (folder !== user.id) {
    return { success: false, error: "Invalid resume file path." };
  }

  const { data: existingPortfolio, error: portfolioLookupError } = await supabase
    .from("portfolios")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (portfolioLookupError || !existingPortfolio) {
    return {
      success: false,
      error: "Portfolio record not found. Try signing out and back in.",
    };
  }

  await supabase
    .from("portfolios")
    .update({
      processing_status: "processing",
      processing_error: null,
      resume_storage_path: input.storagePath,
    })
    .eq("user_id", user.id);

  revalidatePath("/dashboard");

  try {
    const admin = createAdminClient();
    const { data: fileData, error: downloadError } = await admin.storage
      .from("resumes")
      .download(input.storagePath);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message ?? "Failed to download resume file.");
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const resumeText =
      input.mimeType === "application/pdf"
        ? await extractTextFromPdf(buffer)
        : extractTextFromPlainFile(buffer);

    const parsed = await parseResumeText(resumeText);

    const usernameBase =
      parsed.suggested_username ??
      slugifyUsername(parsed.hero_title) ??
      slugifyUsername(user.email?.split("@")[0] ?? "user");

    const username = await ensureUniqueUsername(usernameBase, async (candidate) => {
      const { data } = await admin
        .from("portfolios")
        .select("id")
        .eq("username", candidate)
        .neq("user_id", user.id)
        .maybeSingle();
      return Boolean(data);
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const { error: updateError } = await admin
      .from("portfolios")
      .update({
        username,
        hero_title: parsed.hero_title,
        bio: parsed.bio,
        skills: parsed.skills,
        experience: parsed.experience,
        projects: parsed.projects,
        contact_email: parsed.contact_email,
        processing_status: "completed",
        processing_error: null,
        resume_storage_path: input.storagePath,
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/dashboard");
    revalidatePath(`/p/${username}`);

    return {
      success: true,
      username,
      portfolioUrl: `${siteUrl}/p/${username}`,
    };
  } catch (error) {
    const message =
      error instanceof ResumeParseError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Resume processing failed.";

    await supabase
      .from("portfolios")
      .update({
        processing_status: "failed",
        processing_error: message,
      })
      .eq("user_id", user.id);

    revalidatePath("/dashboard");

    return { success: false, error: message };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
