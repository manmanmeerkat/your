// app/utils/toc.ts
import { makeHeadingId } from "@/app/utils/headingId";

export type TocItem = { id: string; text: string; level: number };

function normalizeHeadingText(raw: string) {
  return raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/[*_`~]/g, "")                  // 強調などの記号を除去
    .replace(/\s+/g, " ")
    .trim();
}

/** ✅ Markdown文字列から ToC を生成（server でも安全） */
export function buildTocFromMarkdown(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,2})\s+(.+)$/gm;
  const headers: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // #=1, ##=2
    const text = normalizeHeadingText(match[2]);
    const id = makeHeadingId(text);
    headers.push({ id, text, level });
  }
  return headers;
}

/** ✅ DOMから ToC を生成（⚠️ client側でだけ呼ぶこと） */
export function buildTocFromDom(containerSelector: string): TocItem[] {
  if (typeof document === "undefined") return []; // ✅ 念のためガード

  const container = document.querySelector(containerSelector);
  if (!container) return [];

  const headings = Array.from(
    container.querySelectorAll("h1[id], h2[id]")
  ) as HTMLElement[];

  return headings.map((h) => ({
    id: h.id,
    text: (h.textContent ?? "").trim(),
    level: h.tagName === "H1" ? 1 : 2,
  }));
}



