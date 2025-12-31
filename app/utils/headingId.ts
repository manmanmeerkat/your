// utils/headingId.ts
export function makeHeadingId(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}
