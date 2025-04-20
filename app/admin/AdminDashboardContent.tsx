// app/admin/AdminDashboardContent.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// 型定義
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category?: string;
  published: boolean;
  createdAt: string;
  images?: ArticleImage[];
}

interface ArticleImage {
  id: string;
  url: string;
  altText?: string;
  isFeatured?: boolean;
}

interface Category {
  id?: string;
  name: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function AdminDashboardContent() {
  // ※ 以下は元のAdminDashboardコンポーネントの内容をそのまま使用
  // 初期マウント時のフラグ
  const initialMountRef = useRef(true);
  const parametersAppliedRef = useRef(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 9,
    pageCount: 1,
    total: 0,
  });
  // カテゴリーフィルタリング用の状態
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // 検索機能用の状態
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // URLパラメータ関連
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const supabase = createClientComponentClient();

  // URLパラメータから初期状態を取得
  useEffect(() => {
    if (!initialMountRef.current) return;

    console.log("URLパラメータから状態を初期化中...");

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = searchParams.get("page");

    let stateChanged = false;
    let newCategoryValue = "";
    let newSearchValue = "";
    let newPage = 1;

    if (category) {
      newCategoryValue = category;
      stateChanged = true;
      console.log("カテゴリーパラメータを検出:", category);
    }

    if (search) {
      newSearchValue = search;
      stateChanged = true;
      console.log("検索パラメータを検出:", search);
    }

    if (page && !isNaN(parseInt(page))) {
      newPage = parseInt(page);
      stateChanged = true;
      console.log("ページパラメータを検出:", newPage);
    }

    // 一括で状態を更新
    if (stateChanged) {
      console.log("検出したURLパラメータで状態を更新します");
      setSelectedCategory(newCategoryValue);
      setSearchQuery(newSearchValue);
      setSearchInput(newSearchValue);
      setPagination((prev) => ({ ...prev, page: newPage }));
      parametersAppliedRef.current = true;
    }

    initialMountRef.current = false;
  }, [searchParams]);

  // URLパラメータの更新関数
  const updateUrlParams = useCallback(() => {
    // 初期化処理中は実行しない
    if (initialMountRef.current) return;

    const params = new URLSearchParams();

    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    if (searchQuery) {
      params.append("search", searchQuery);
    }

    if (pagination.page > 1) {
      params.append("page", pagination.page.toString());
    }

    // URLを更新（ページリロードなし）
    const url = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router, selectedCategory, searchQuery, pagination.page]);

  // 状態変更時にURLを更新
  useEffect(() => {
    if (!initialMountRef.current) {
      updateUrlParams();
    }
  }, [selectedCategory, searchQuery, pagination.page, updateUrlParams]);

  // ページを変更する関数
  const changePage = (newPage: number): void => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // カテゴリー選択を変更する関数
  const handleCategoryChange = (category: string): void => {
    console.log("カテゴリー変更:", category);
    setSelectedCategory(category);
    // カテゴリーを変更したらページを1に戻す
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 検索実行関数
  const handleSearch = (): void => {
    const trimmedQuery = searchInput.trim();
    console.log("検索実行:", trimmedQuery);
    setSearchQuery(trimmedQuery);
    // 検索時にページを1に戻す
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 検索リセット関数
  const resetSearch = (): void => {
    console.log("検索リセット");
    setSearchInput("");
    setSearchQuery("");
    // 検索リセット時にページを1に戻す
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Enter キーで検索を実行
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 編集リンクを生成する関数
  const getEditLink = (slug: string): string => {
    // 現在のフィルター状態をパラメータとして渡す
    const params = new URLSearchParams();

    // 戻り先のパスを指定
    params.append("returnPath", pathname);

    // フィルター状態をパラメータとして追加
    if (selectedCategory) params.append("category", selectedCategory);
    if (searchQuery) params.append("search", searchQuery);
    if (pagination.page > 1) params.append("page", pagination.page.toString());

    // 強制的に現在のタブを割り当てるフラグ
    params.append("forceFilter", "true");

    return `/admin/articles/${slug}?${params.toString()}`;
  };

  // 並行APIリクエストを行い、カテゴリー一覧と記事を取得する関数
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      console.log("データ取得開始");
      console.log("現在のフィルター状態:", {
        category: selectedCategory,
        search: searchQuery,
        page: pagination.page,
      });

      // セッション確認
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("セッションなし - ログインページへリダイレクト");
        window.location.href = "/admin/login";
        return;
      }

      // 並行リクエスト実行
      const [categoriesResponse, articlesResponse] = await Promise.all([
        // カテゴリー取得（最初の1回のみ）
        categories.length === 0
          ? fetch("/api/categories", { credentials: "include" })
          : Promise.resolve(new Response(JSON.stringify({ categories }))),

        // 記事取得
        (async () => {
          // APIリクエスト用のパラメータを構築
          const queryParams = new URLSearchParams();
          queryParams.append("page", pagination.page.toString());
          queryParams.append("pageSize", pagination.pageSize.toString());
          queryParams.append("includeImages", "true");

          // カテゴリーフィルターを追加
          if (selectedCategory) {
            queryParams.append("category", selectedCategory);
          }

          // 検索クエリを追加
          if (searchQuery) {
            queryParams.append("search", searchQuery);
          }

          // デバッグ情報: 実際に使用するAPI URL
          const apiUrl = `/api/articles?${queryParams.toString()}`;
          console.log("記事取得API呼び出し:", apiUrl);

          return fetch(apiUrl, { credentials: "include" });
        })(),
      ]);

      // カテゴリーレスポンス処理
      if (categories.length === 0) {
        if (!categoriesResponse.ok) {
          throw new Error(`カテゴリー取得エラー: ${categoriesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        if (categoriesData.categories) {
          setCategories(categoriesData.categories);
        }
      }

      // 記事レスポンス処理
      if (!articlesResponse.ok) {
        throw new Error(`記事取得エラー: ${articlesResponse.status}`);
      }

      const articlesData = await articlesResponse.json();
      console.log("記事データ取得成功:", articlesData);

      if (articlesData.articles) {
        setArticles(articlesData.articles);
        if (articlesData.pagination) {
          setPagination(articlesData.pagination);
        }
      } else {
        console.warn("記事データが空です");
        setArticles([]);
      }

      setError(null);
    } catch (error: any) {
      console.error("データ取得エラー:", error);
      setError(error.message || "データの読み込みに失敗しました");
      setArticles([]);
    } finally {
      setLoading(false);
      console.log("データ取得完了");
    }
  }, [
    categories,
    pagination.page,
    pagination.pageSize,
    selectedCategory,
    searchQuery,
    supabase,
  ]);

  // 初期データ読み込みとフィルター変更時の再取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 記事の特集画像を取得するヘルパー関数
  const getFeaturedImage = (article: Article): ArticleImage | null => {
    if (article.images && article.images.length > 0) {
      // 特集画像（isFeatured=true）を優先
      const featuredImage = article.images.find((img) => img.isFeatured);
      if (featuredImage) return featuredImage;

      // 特集画像がなければ最初の画像を使用
      return article.images[0];
    }
    return null;
  };

  // 日付フォーマット関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`;
  };

  // HTML本文からプレーンテキストを抽出
  const getPlainTextFromHtml = (html: string): string => {
    if (!html) return "";
    // HTMLタグを除去して純粋なテキストだけを取得
    return html.replace(/<[^>]*>/g, "");
  };

  // デバッグ情報
  console.log("現在の状態:", {
    selectedCategory,
    searchQuery,
    pageNumber: pagination.page,
    articlesCount: articles.length,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">記事管理</h2>
        <Link href="/admin/articles/new">
          <Button>新規記事作成</Button>
        </Link>
      </div>

      {/* カテゴリーフィルター */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">カテゴリー:</span>
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("")}
          >
            すべて
          </Button>

          {categories.map((category: Category) => (
            <Button
              key={category.id || category.name}
              variant={
                selectedCategory === category.name ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleCategoryChange(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 検索ボックス */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <div className="flex items-center gap-2">
          <div className="flex-grow flex items-center gap-2">
            <span className="font-medium">タイトル検索:</span>
            <Input
              type="text"
              placeholder="記事タイトルでキーワード検索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSearch}
              disabled={searchInput.trim() === ""}
            >
              検索
            </Button>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={resetSearch}>
                検索解除
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* デバッグ情報 - 開発時のみ表示 */}
      {process.env.NODE_ENV !== "production" && (
        <div className="bg-slate-100 p-3 rounded text-xs">
          <p>選択カテゴリー: {selectedCategory || "(なし)"}</p>
          <p>検索キーワード: {searchQuery || "(なし)"}</p>
          <p>
            ページ: {pagination.page} / {pagination.pageCount}
          </p>
          <p>表示件数: {articles.length} 件</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* アクティブなフィルター表示 */}
          {(selectedCategory || searchQuery) && (
            <div className="bg-blue-50 p-3 rounded flex flex-wrap gap-2 items-center">
              <p className="font-medium">アクティブなフィルター:</p>

              {selectedCategory && (
                <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>カテゴリー: {selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryChange("")}
                    className="text-blue-500 hover:text-blue-700 ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {searchQuery && (
                <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>検索: "{searchQuery}"</span>
                  <button
                    onClick={resetSearch}
                    className="text-blue-500 hover:text-blue-700 ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {(selectedCategory || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleCategoryChange("");
                    resetSearch();
                  }}
                  className="ml-auto"
                >
                  すべて解除
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles && articles.length > 0 ? (
              articles.map((article: Article) => {
                const featuredImage = getFeaturedImage(article);
                const plainContent = getPlainTextFromHtml(article.content);
                const excerptContent =
                  plainContent.length > 100
                    ? `${plainContent.substring(0, 100)}...`
                    : plainContent;

                return (
                  <div key={article.id} className="bg-gray-50 rounded shadow">
                    <div className="flex p-4">
                      {/* 画像コンテナ - 左側 */}
                      <div className="flex-shrink-0 w-32 h-32 relative mr-4">
                        {featuredImage ? (
                          <Image
                            src={featuredImage.url}
                            alt={featuredImage.altText || article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">画像なし</p>
                          </div>
                        )}
                      </div>

                      {/* 記事情報 - 右側 */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-1">
                          {article.title}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(article.createdAt)}
                        </div>

                        {/* 記事本文の抜粋 */}
                        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                          {article.summary || excerptContent}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm">
                            {article.category && (
                              <span className="font-medium">
                                {article.category}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span
                              className={
                                article.published
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }
                            >
                              {article.published ? "公開中" : "下書き"}
                            </span>
                          </div>
                        </div>

                        {/* 編集ページへのリンクを動的に生成 */}
                        <Link href={getEditLink(article.slug)}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm py-1"
                          >
                            記事を編集
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center py-12 text-base">
                {selectedCategory || searchQuery
                  ? `条件に一致する記事がありません。${
                      selectedCategory
                        ? `カテゴリー「${selectedCategory}」`
                        : ""
                    }${selectedCategory && searchQuery ? "、" : ""}${
                      searchQuery ? `検索キーワード「${searchQuery}」` : ""
                    }`
                  : "記事がありません。新しい記事を作成してください。"}
              </p>
            )}
          </div>

          {/* ページネーション UI */}
          {pagination.pageCount > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pagination.page === 1}
              >
                最初
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                前へ
              </Button>

              <div className="px-4">
                <span className="font-medium">{pagination.page}</span>
                <span className="text-slate-500">
                  {" "}
                  / {pagination.pageCount}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pageCount}
              >
                次へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.pageCount)}
                disabled={pagination.page === pagination.pageCount}
              >
                最後
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
