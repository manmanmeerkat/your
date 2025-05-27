// hooks/usePaginationOptimization.ts
import { useCallback, useRef, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UsePaginationOptimizationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function usePaginationOptimization({
  currentPage,
  totalPages,
  basePath = '/all-articles'
}: UsePaginationOptimizationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // URL更新の頻度を制限するためのデバウンス
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  // プリフェッチ済みページを追跡
  const prefetchedPages = useRef<Set<number>>(new Set());
  
  // 最適化されたURLパラメータ構築
  const buildUrl = useCallback((page: number) => {
    const params = new URLSearchParams();
    
    // 現在のパラメータをコピー（ページ以外）
    searchParams.forEach((value, key) => {
      if (key !== 'page') {
        params.set(key, value);
      }
    });
    
    // ページが1でない場合のみページパラメータを追加
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    return params.toString() 
      ? `${basePath}?${params.toString()}`
      : basePath;
  }, [searchParams, basePath]);

  // デバウンス付きページ変更
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }

    // 既存のタイマーをクリア
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // デバウンス処理
    debounceTimer.current = setTimeout(() => {
      startTransition(() => {
        const newUrl = buildUrl(page);
        router.replace(newUrl, { scroll: false });
      });
    }, 100); // 100ms のデバウンス
  }, [currentPage, totalPages, buildUrl, router]);

  // 隣接ページのプリフェッチ
  const prefetchAdjacentPages = useCallback(() => {
    const pagesToPrefetch = [];
    
    // 前のページ
    if (currentPage > 1) {
      pagesToPrefetch.push(currentPage - 1);
    }
    
    // 次のページ
    if (currentPage < totalPages) {
      pagesToPrefetch.push(currentPage + 1);
    }
    
    // 最初と最後のページ
    if (currentPage > 3) {
      pagesToPrefetch.push(1);
    }
    if (currentPage < totalPages - 2) {
      pagesToPrefetch.push(totalPages);
    }

    pagesToPrefetch.forEach(page => {
      if (!prefetchedPages.current.has(page)) {
        const url = buildUrl(page);
        router.prefetch(url);
        prefetchedPages.current.add(page);
      }
    });
  }, [currentPage, totalPages, buildUrl, router]);

  // ページ範囲の計算（メモ化）
  const visiblePageRange = useMemo(() => {
    const delta = 2; // 現在のページの前後に表示するページ数
    const rangeWithDots: (number | string)[] = [];

    // 計算の最適化
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // 最初のページと省略記号
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // 中間のページ
    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }

    // 最後のページと省略記号
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // キーボードショートカットのサポート
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (event.target && (event.target as HTMLElement).tagName === 'INPUT') {
      return; // 入力フィールドでは無効化
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
        break;
      case 'ArrowRight':
        if (currentPage < totalPages) {
          handlePageChange(currentPage + 1);
        }
        break;
      case 'Home':
        if (currentPage !== 1) {
          handlePageChange(1);
        }
        break;
      case 'End':
        if (currentPage !== totalPages) {
          handlePageChange(totalPages);
        }
        break;
    }
  }, [currentPage, totalPages, handlePageChange]);

  return {
    handlePageChange,
    prefetchAdjacentPages,
    visiblePageRange,
    handleKeyboardNavigation,
    isPending,
    buildUrl,
  };
}