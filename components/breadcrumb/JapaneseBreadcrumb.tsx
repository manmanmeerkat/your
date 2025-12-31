// components/breadcrumb/Breadcrumb.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import {
  BREADCRUMB_CONFIG,
  type CategoryKey,
  type PageKey,
} from "@/components/breadcrumb/config";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

// type guards
const isCategoryKey = (key: string): key is CategoryKey =>
  key in BREADCRUMB_CONFIG.categories;

const isPageKey = (key: string): key is PageKey =>
  key in BREADCRUMB_CONFIG.pages;

// pathname から自動生成（fallback 用）
const generateBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    let label = segment;

    if (isCategoryKey(segment)) {
      label = BREADCRUMB_CONFIG.categories[segment].label;
    } else if (isPageKey(segment)) {
      label = BREADCRUMB_CONFIG.pages[segment];
    } else {
      label = segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    items.push({
      label,
      href: currentPath,
      isCurrentPage: isLast,
    });
  });

  return items;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  customItems,
  className = "",
}) => {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  const breadcrumbItems = customItems ?? generateBreadcrumbItems(pathname);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 pt-4 pb-2 text-sm text-[#e8ddd4]">
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
