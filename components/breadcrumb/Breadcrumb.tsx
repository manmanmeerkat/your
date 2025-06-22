// components/breadcrumb/Breadcrumb.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BREADCRUMB_CONFIG, CategoryKey, PageKey } from "./config";

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

  // Do not display on homepage or admin pages
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`bg-transparent border-b border-red-900/30 ${className}`}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li
              key={item.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-red-700/50 mx-2"
                  aria-hidden="true"
                />
              )}

              {item.isCurrentPage ? (
                <span
                  className="font-medium text-white/90"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-red-300/80 hover:text-white transition-colors duration-300"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 1)} />
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
