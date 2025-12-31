// components/breadcrumb/config.ts

export type PageKey =
  | "about"
  | "contact"
  | "all-articles"
  | "privacy-policy"
  | "category-item"
  | "articles";

export type CategoryKey =
  | "culture"
  | "customs"
  | "festivals"
  | "mythology"
  | "about-japanese-gods";

export type CategoryNode = {
  label: string;
  parent?: CategoryKey;
};

const categories: Record<CategoryKey, CategoryNode> = {
  culture: { label: "Culture" },
  customs: { label: "Customs" },
  festivals: { label: "Festivals" },
  mythology: { label: "Mythology" },
  "about-japanese-gods": { label: "Japanese Gods", parent: "mythology" },
};

const pages: Record<PageKey, string> = {
  about: "About",
  contact: "Contact",
  "all-articles": "All Articles",
  "privacy-policy": "Privacy Policy",
  "category-item": "Category",
  articles: "Articles",
};

export const BREADCRUMB_CONFIG = {
  categories,
  pages,
} as const;

// --- structured data はそのままでOK ---
export function generateBreadcrumbStructuredData(
  breadcrumbItems: Array<{ label: string; href: string; isCurrentPage?: boolean }>
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.yoursecretjapan.com";

  const toAbs = (href: string) => (href.startsWith("http") ? href : `${baseUrl}${href}`);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: toAbs(item.href),
    })),
  };
}
