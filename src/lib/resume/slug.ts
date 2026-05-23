export function slugifyUsername(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "portfolio";
}

export async function ensureUniqueUsername(
  base: string,
  isTaken: (username: string) => Promise<boolean>
): Promise<string> {
  const normalized = slugifyUsername(base);
  let candidate = normalized;
  let suffix = 1;

  while (await isTaken(candidate)) {
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
