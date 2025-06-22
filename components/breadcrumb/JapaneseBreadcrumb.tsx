// components/breadcrumb/Breadcrumb.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Type definitions
type CategoryKey = "culture" | "customs" | "festivals" | "mythology";
type PageKey =
  | "about"
  | "contact"
  | "all-articles"
  | "privacy-policy"
  | "category-item"
  | "articles";

// Breadcrumb configuration
const BREADCRUMB_CONFIG = {
  categories: {
    culture: "Culture",
    customs: "Customs",
    festivals: "Festivals",
    mythology: "Mythology",
  } satisfies Record<CategoryKey, string>,
  pages: {
    about: "About",
    contact: "Contact",
    "all-articles": "All Articles",
    "privacy-policy": "Privacy Policy",
    "category-item": "Category",
    articles: "Articles",
  } satisfies Record<PageKey, string>,
} as const;

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

// Type guard functions
const isCategoryKey = (key: string): key is CategoryKey => {
  return key in BREADCRUMB_CONFIG.categories;
};

const isPageKey = (key: string): key is PageKey => {
  return key in BREADCRUMB_CONFIG.pages;
};

// Function to generate breadcrumb items from the path
const generateBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLastSegment = index === segments.length - 1;

    let label = segment;

    if (index === 0) {
      if (isCategoryKey(segment)) {
        label = BREADCRUMB_CONFIG.categories[segment];
      } else if (isPageKey(segment)) {
        label = BREADCRUMB_CONFIG.pages[segment];
      }
    } else if (segments[0] === "category-item" && index === 1) {
      if (isCategoryKey(segment)) {
        label = BREADCRUMB_CONFIG.categories[segment];
      }
    } else {
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    items.push({
      label,
      href: currentPath,
      isCurrentPage: isLastSegment,
    });
  });

  return items;
};

// Main Breadcrumb component
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  customItems,
  className = "",
}) => {
  const pathname = usePathname();

  const breadcrumbItems = customItems || generateBreadcrumbItems(pathname);

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`bg-black/20 border-b border-white/10 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3 text-sm text-gray-300">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-gray-500 mx-2"
                  aria-hidden="true"
                />
              )}

              {item.isCurrentPage ? (
                <span
                  className="font-medium text-white flex items-center"
                  aria-current="page"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 mr-2" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors duration-200 flex items-center"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 mr-2" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export { Breadcrumb };

// ForcedBreadcrumbコンポーネントはファイル内に存在しないため、
// エクスポートから削除しました。
// もし必要であれば、このファイルに追加するか、別のファイルからインポートしてください。
