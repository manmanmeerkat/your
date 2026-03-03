// components/sidebar/RelatedArticles.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../../ui/button";

export type RelatedItem = {
  id: string;
  slug: string;
  title: string;
  href: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

interface RelatedArticlesProps {
  items: RelatedItem[];
  currentCategory: string;
  loading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  mythology: "Mythology",
  culture: "Culture",
  festivals: "Festivals",
  customs: "Customs",
  "about-japanese-gods": "Gods",
  "japanese-gods": "Japanese Gods",
};

function getViewAllHref(category: string) {
  const c = category.toLowerCase();

  // ✅ DB が about-japanese-gods / japanese-gods どっちでも吸収
  if (c === "about-japanese-gods" || c === "japanese-gods") {
    return "/mythology#japanese-gods";
  }

  return `/${c}`;
}

function normalizeImageSrc(src?: string | null): string | null {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s;
  return `/${s}`;
}

function PrimaryArrowButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      size="lg"
      className={[
        "min-w-[240px] h-12",
        "flex items-center justify-center",
        "leading-none font-semibold tracking-wide",
        "border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2]",
        "hover:brightness-110 hover:-translate-y-[1px]",
        "transition-all duration-200",
        "shadow-md hover:shadow-lg",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "group",
        "px-5 py-3 whitespace-normal text-center",
        "leading-snug",
        className,
      ].join(" ")}
    >
      {children}
      <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </Button>
  );
}

function SkeletonCard() {
  return (
    <div
      className={[
        "relative flex gap-4 p-4 rounded-xl",
        "bg-[rgba(255,255,255,0.035)]",
        "border border-[rgba(255,255,255,0.12)]",
        "animate-pulse",
      ].join(" ")}
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white/10" />
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="h-4 w-4/5 rounded bg-white/10" />
        <div className="h-4 w-3/5 rounded bg-white/10" />
        <div className="mt-auto flex justify-end">
          <div className="h-9 w-28 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function RelatedArticles({ items, currentCategory, loading }: RelatedArticlesProps) {

  // loading中はスケルトンだけ出す（枠は同じ）
  const showSkeleton = loading && (!items || items.length === 0);

  if ((!items || items.length === 0) && !showSkeleton) return null

  const c = currentCategory.toLowerCase();
  const label = CATEGORY_LABELS[c] ?? currentCategory;
  const viewAllHref = getViewAllHref(currentCategory);

  return (
    <aside
      className={[
        "w-full overflow-hidden rounded-2xl",
        "border border-[rgba(255,255,255,0.14)]",
        "shadow-[0_18px_45px_rgba(0,0,0,0.45),_inset_0_1px_0_rgba(255,255,255,0.07)]",
        "bg-gradient-to-br from-[#221a18] via-[#15110f] to-[#221a18]",
        "sticky top-[calc(var(--header-h)+16px)] self-start",
      ].join(" ")}
    >
      <div
        className={[
          "px-6 py-4",
          "border-b border-[rgba(255,255,255,0.10)]",
          "bg-gradient-to-b from-[rgba(255,255,255,0.06)] to-transparent",
        ].join(" ")}
      >
        <h3 className="m-0 text-center text-[1.25rem] font-semibold tracking-wider text-[#f3f3f2]">
          More Japanese {label}
        </h3>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-[rgba(201,106,93,0.9)] to-transparent" />
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {showSkeleton ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            items.map((a) => <RelatedArticleCard key={a.id} item={a} />)
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.10)] flex justify-center">
          <Link href={viewAllHref} className="inline-flex">
            <PrimaryArrowButton className="min-w-[220px] h-11 text-[0.98rem]">
              View All {label}
            </PrimaryArrowButton>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function RelatedArticleCard({ item }: { item: RelatedItem }) {
  const normalizedSrc = normalizeImageSrc(item.imageUrl);
  const hasValidImage = typeof normalizedSrc === "string" && normalizedSrc.length > 0;

  return (
    <Link
      href={item.href} // ✅ ここが /articles 固定じゃなくなる
      className={[
        "group relative flex gap-4 p-4 rounded-xl",
        "bg-[rgba(255,255,255,0.035)]",
        "border border-[rgba(255,255,255,0.12)]",
        "transition-all duration-200",
        "hover:bg-[rgba(201,106,93,0.14)]",
        "hover:border-[rgba(201,106,93,0.55)]",
        "hover:shadow-[0_14px_34px_rgba(0,0,0,0.55)]",
        "hover:-translate-y-[2px]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,106,93,0.55)] focus-visible:ring-offset-0",
      ].join(" ")}
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.25)]">
        {hasValidImage ? (
          <Image
            src={normalizedSrc!}
            alt={item.imageAlt || item.title}
            width={80}
            height={80}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/40 text-lg">🖼️</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h4 className="font-semibold text-[#f3f3f2] leading-tight mb-4 line-clamp-2 group-hover:text-white">
          {item.title}
        </h4>

        <div className="mt-auto flex justify-end">
          <Button
            size="sm"
            className="h-9 px-4 rounded-full border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2] font-semibold"
          >
            Read more <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
