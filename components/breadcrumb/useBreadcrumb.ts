'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface UseBreadcrumbOptions {
  articleTitle?: string;
  categoryItemTitle?: string;
  customItems?: BreadcrumbItem[];
}

interface UseBreadcrumbReturn {
  breadcrumbItems: BreadcrumbItem[];
  isLoading: boolean;
  error: string | null;
}

export const useBreadcrumb = (options: UseBreadcrumbOptions = {}): UseBreadcrumbReturn => {
  const pathname = usePathname();
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリーの日本語名
  const CATEGORIES = {
    culture: '文化',
    customs: '風習',
    festivals: '祭り',
    mythology: '神話',
  };

  // 固定ページの日本語名
  const PAGES = {
    'about': 'サイトについて',
    'contact': 'お問い合わせ',
    'all-articles': '全記事一覧',
    'privacy-policy': 'プライバシーポリシー',
    'admin': '管理画面',
    'category-item': 'カテゴリー',
    'articles': '記事',
  };

  // 管理画面の日本語名
  const ADMIN_PAGES = {
    'articles': '記事管理',
    'category-item': 'カテゴリー管理',
    'messages': 'メッセージ管理',
    'login': 'ログイン',
  };

  // 記事タイトルを取得する関数
  const fetchArticleTitle = async (slug: string): Promise<string> => {
    try {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) {
        throw new Error('記事が見つかりません');
      }
      const article = await response.json();
      return article.title || slug;
    } catch (error) {
      console.error('記事タイトルの取得に失敗しました:', error);
      return slug;
    }
  };

  // カテゴリーアイテムタイトルを取得する関数
  const fetchCategoryItemTitle = async (categorySlug: string, itemSlug: string): Promise<string> => {
    try {
      const response = await fetch(`/api/category-items/${categorySlug}/${itemSlug}`);
      if (!response.ok) {
        throw new Error('カテゴリーアイテムが見つかりません');
      }
      const item = await response.json();
      return item.title || itemSlug;
    } catch (error) {
      console.error('カテゴリーアイテムタイトルの取得に失敗しました:', error);
      return itemSlug;
    }
  };

  // パンくずリストアイテムを生成する関数
  const generateBreadcrumbItems = async (): Promise<BreadcrumbItem[]> => {
    // カスタムアイテムが提供されている場合はそれを使用
    if (options.customItems) {
      return options.customItems;
    }

    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      {
        label: 'ホーム',
        href: '/',
      }
    ];

    let currentPath = '';

    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      currentPath += `/${segment}`;
      const isLastSegment = index === segments.length - 1;

      let label = segment;

      // セグメントの日本語名を取得
      if (index === 0) {
        // 第一階層
        if (CATEGORIES[segment as keyof typeof CATEGORIES]) {
          label = CATEGORIES[segment as keyof typeof CATEGORIES];
        } else if (PAGES[segment as keyof typeof PAGES]) {
          label = PAGES[segment as keyof typeof PAGES];
        }
      } else if (segments[0] === 'admin' && index === 1) {
        // 管理画面の第二階層
        if (ADMIN_PAGES[segment as keyof typeof ADMIN_PAGES]) {
          label = ADMIN_PAGES[segment as keyof typeof ADMIN_PAGES];
        }
      } else if (segments[0] === 'articles' && index === 1) {
        // 記事の場合
        if (options.articleTitle) {
          label = options.articleTitle;
        } else {
          label = await fetchArticleTitle(segment);
        }
      } else if (segments[0] === 'category-item' && index === 1) {
        // カテゴリーの場合
        if (CATEGORIES[segment as keyof typeof CATEGORIES]) {
          label = CATEGORIES[segment as keyof typeof CATEGORIES];
        }
      } else if (segments[0] === 'category-item' && index === 2) {
        // カテゴリーアイテムの場合
        if (options.categoryItemTitle) {
          label = options.categoryItemTitle;
        } else {
          const categorySlug = segments[1];
          label = await fetchCategoryItemTitle(categorySlug, segment);
        }
      } else {
        // その他の場合は、スラッグから推測
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      items.push({
        label,
        href: currentPath,
        isCurrentPage: isLastSegment,
      });
    }

    return items;
  };

  useEffect(() => {
    const loadBreadcrumbItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await generateBreadcrumbItems();
        setBreadcrumbItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
        // エラーが発生した場合は基本的なパンくずリストを生成
        const segments = pathname.split('/').filter(Boolean);
        const fallbackItems: BreadcrumbItem[] = [
          { label: 'ホーム', href: '/' },
          ...segments.map((segment, index) => ({
            label: segment,
            href: `/${segments.slice(0, index + 1).join('/')}`,
            isCurrentPage: index === segments.length - 1,
          }))
        ];
        setBreadcrumbItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreadcrumbItems();
  }, [pathname, options.articleTitle, options.categoryItemTitle, options.customItems]);

  return {
    breadcrumbItems,
    isLoading,
    error,
  };
};