export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text.trim();

  if (!text) {
    throw new Error("Could not extract any text from the PDF resume.");
  }

  return text;
}

export function extractTextFromPlainFile(buffer: Buffer): string {
  const text = buffer.toString("utf-8").trim();

  if (!text) {
    throw new Error("The uploaded text file is empty.");
  }

  return text;
}
