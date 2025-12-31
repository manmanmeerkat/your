import { useMemo } from "react";
import { makeHeadingId } from "@/app/utils/headingId";

export type TocItem = { id: string; text: string; level: number };

export function useToc(markdown: string) {
  return useMemo(() => {
    const headingRegex = /^(#{1,2})\s+(.+)$/gm;
    const headers: TocItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = makeHeadingId(text);
      headers.push({ id, text, level });
    }

    return headers;
  }, [markdown]);
}
