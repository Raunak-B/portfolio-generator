import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const normalized = Array.isArray(text) ? text.join("\n") : text;
  const trimmed = normalized.trim();

  if (!trimmed) {
    throw new Error("Could not extract any text from the PDF resume.");
  }

  return trimmed;
}

export function extractTextFromPlainFile(buffer: Buffer): string {
  const content = buffer.toString("utf-8").trim();

  if (!content) {
    throw new Error("The uploaded text file is empty.");
  }

  return content;
}
