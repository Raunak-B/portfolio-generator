"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { parseResumeAction } from "@/actions/parse-resume";
import { createClient } from "@/lib/supabase/client";
import type { OwnerResumePortfolio, ProcessingStatus } from "@/types/portfolio";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
} as const;

type ResumeUploadProps = {
  userId: string;
  portfolio: OwnerResumePortfolio | null;
  siteUrl: string;
};

export function ResumeUpload({
  userId,
  portfolio,
  siteUrl,
}: ResumeUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const status: ProcessingStatus = portfolio?.processing_status ?? "idle";
  const permanentUrl = portfolio?.username
    ? `${siteUrl}/p/${portfolio.username}`
    : null;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccessUrl(null);

      const mimeType = file.type;
      const isPdf = mimeType === "application/pdf";
      const isText = mimeType === "text/plain";

      if (!isPdf && !isText) {
        setError("Please upload a PDF or plain text (.txt) resume.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File must be 10 MB or smaller.");
        return;
      }

      setUploading(true);

      try {
        const supabase = createClient();
        const extension = isPdf ? "pdf" : "txt";
        const storagePath = `${userId}/${Date.now()}-resume.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: mimeType,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setUploading(false);
        setProcessing(true);

        const result = await parseResumeAction({
          storagePath,
          mimeType,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        setSuccessUrl(result.portfolioUrl);
        router.refresh();
      } catch (uploadErr) {
        setError(
          uploadErr instanceof Error
            ? uploadErr.message
            : "Upload failed. Please try again."
        );
      } finally {
        setUploading(false);
        setProcessing(false);
      }
    },
    [router, userId]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const isBusy = uploading || processing || status === "processing";

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-slate-600 bg-slate-900/50 hover:border-slate-400"
        } ${isBusy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={Object.keys(ACCEPTED_TYPES).join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <p className="text-lg font-semibold text-white">
          {uploading
            ? "Uploading resume…"
            : processing || status === "processing"
              ? "AI is processing your resume…"
              : "Drag & drop your resume"}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          PDF or plain text (.txt) · Max 10 MB · Free unlimited parsing
        </p>
        {!isBusy ? (
          <p className="mt-4 text-sm text-cyan-400">or click to browse files</p>
        ) : null}
      </div>

      {status === "processing" && !processing ? (
        <StatusBanner
          tone="info"
          message="Your resume is being parsed by AI. This page will update when finished — refresh if needed."
        />
      ) : null}

      {status === "failed" && portfolio?.processing_error ? (
        <StatusBanner tone="error" message={portfolio.processing_error} />
      ) : null}

      {error ? <StatusBanner tone="error" message={error} /> : null}

      {(successUrl || (status === "completed" && permanentUrl)) && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <p className="text-sm font-medium text-emerald-300">
            Portfolio ready
          </p>
          <a
            href={successUrl ?? permanentUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-cyan-400 underline hover:text-cyan-300"
          >
            {successUrl ?? permanentUrl}
          </a>
        </div>
      )}
    </div>
  );
}

function StatusBanner({
  tone,
  message,
}: {
  tone: "info" | "error";
  message: string;
}) {
  const styles =
    tone === "error"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      {message}
    </div>
  );
}
