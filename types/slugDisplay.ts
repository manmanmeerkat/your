// types/display.ts
export type DisplayImage = {
  url: string;
  alt: string;
  isFeatured: boolean;
};

export type DisplayTrivia = {
  id: string;
  title: string;
  content: string;
  contentEn: string | null;
  tags: string[];
  isActive: boolean;
};

export type DisplayDoc = {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string; // ISO文字列
  catchCopy?: string | null; // ← ★これ追加
  images: DisplayImage[];
  trivia: DisplayTrivia[];
};