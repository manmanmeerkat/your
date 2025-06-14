// components/pagination-wrapper.tsx - パフォーマンス改善版
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { Pagination } from "@/components/pagination/Pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  prefetchRange?: number; // 新しいオプション
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  basePath,
  prefetchRange = 2, // デフォルト2ページ先読み
}: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 🚀 パフォーマンス改善: ページ変更処理の最適化
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());

        // 📱 スムーズなナビゲーション
        router.push(`${basePath}?${params.toString()}`, { scroll: false });

        // ページトップにスクロール
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      });
    },
    [currentPage, totalPages, searchParams, basePath, router]
  );

  // 🎯 プリフェッチ最適化: 隣接ページの事前読み込み
  const prefetchPages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - prefetchRange);
    const end = Math.min(totalPages, currentPage + prefetchRange);

    for (let i = start; i <= end; i++) {
      if (i !== currentPage) {
        pages.push(i);
      }
    }
    return pages;
  }, [currentPage, totalPages, prefetchRange]);

  // プリフェッチ実行
  useEffect(() => {
    prefetchPages.forEach((page) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.prefetch(`${basePath}?${params.toString()}`);
    });
  }, [prefetchPages, basePath, router, searchParams]);

  // 🎯 ホバープリフェッチ（既存のPaginationコンポーネントのonPageHoverを活用）
  const handlePageHover = useCallback(
    (page: number) => {
      if (page !== currentPage && page >= 1 && page <= totalPages) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.prefetch(`${basePath}?${params.toString()}`);
      }
    },
    [currentPage, totalPages, searchParams, basePath, router]
  );

  // ⌨️ キーボードナビゲーション（既存機能と重複しないよう調整）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Paginationコンポーネント内のキーボード処理と重複しないよう、
      // より具体的なキーのみを処理
      switch (event.key) {
        case "PageUp":
          if (currentPage > 1) {
            event.preventDefault();
            handlePageChange(currentPage - 1);
          }
          break;
        case "PageDown":
          if (currentPage < totalPages) {
            event.preventDefault();
            handlePageChange(currentPage + 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="relative">
      {/* 📱 ローディング状態の表示 */}
      {isPending && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 rounded">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Loading...</span>
          </div>
        </div>
      )}

      {/* 🎯 既存のPaginationコンポーネントを活用 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageHover={handlePageHover} // ホバープリフェッチを追加
        disabled={isPending}
        siblingCount={2}
        showQuickJumper={true}
      />

      {/* 📋 パフォーマンス情報表示（開発時のみ） */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Prefetched: {prefetchPages.join(", ")} | Loading:{" "}
          {isPending ? "Yes" : "No"}
        </div>
      )}

      {/* ⌨️ キーボードショートカットヒント */}
      <div className="mt-2 text-center text-sm text-gray-400">
        Use PageUp/PageDown keys for quick navigation
      </div>
    </div>
  );
}

// API最適化: app/api/articles/route.ts の改善版
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prismaクライアント

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const published = searchParams.get("published") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "6"))
    );
    const skip = (page - 1) * pageSize;

    // 📊 パフォーマンス改善: 並列クエリ実行
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: {
          ...(category && { category }),
          ...(published !== undefined && { published }),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          category: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          images: {
            where: { isFeatured: true },
            take: 1,
            select: {
              id: true,
              url: true,
              altText: true,
              isFeatured: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.article.count({
        where: {
          ...(category && { category }),
          ...(published !== undefined && { published }),
        },
      }),
    ]);

    const pageCount = Math.ceil(totalCount / pageSize);

    return NextResponse.json(
      {
        articles,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          pageCount,
        },
      },
      {
        // 📈 レスポンスキャッシュヘッダー
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          "CDN-Cache-Control": "public, s-maxage=3600",
          Vary: "Accept-Encoding",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
