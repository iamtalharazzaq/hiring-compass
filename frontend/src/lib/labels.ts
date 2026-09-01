const acronyms = new Set(["ai", "api", "jd", "pdf", "url", "hr"]);
export function displayLabel(value: string | null | undefined): string {
  return value?.replace(/[\s_-]+/g, " ").trim().split(" ").filter(Boolean).map((word) => acronyms.has(word.toLowerCase()) ? word.toUpperCase() : `${word[0]?.toUpperCase() ?? ""}${word.slice(1).toLowerCase()}`).join(" ") ?? "";
}
