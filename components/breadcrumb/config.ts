// components/breadcrumb/config.ts

// Type definitions
export type CategoryKey = 'culture' | 'customs' | 'festivals' | 'mythology';
export type PageKey = 'about' | 'contact' | 'all-articles' | 'privacy-policy' | 'category-item' | 'articles';

// Breadcrumb configuration
export const BREADCRUMB_CONFIG = {
  categories: {
    culture: 'Culture',
    customs: 'Customs',
    festivals: 'Festivals',
    mythology: 'Mythology',
  } satisfies Record<CategoryKey, string>,
  pages: {
    about: 'About',
    contact: 'Contact',
    'all-articles': 'All Articles',
    'privacy-policy': 'Privacy Policy',
    'category-item': 'Category',
    articles: 'Articles',
  } satisfies Record<PageKey, string>,
} as const;

// SEO: パンくずリスト用の構造化データ生成関数
export function generateBreadcrumbStructuredData(breadcrumbItems: Array<{ label: string; href: string; isCurrentPage?: boolean }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursecretjapan.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${baseUrl}${item.href}`
    }))
  };
} 