"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ImprovedPagination } from "@/components/ui/improved-pagination";
import { Search, Replace, Eye, Play, AlertTriangle } from "lucide-react";

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

interface ContentMatch {
  snippet: string;
  position: number;
  highlighted: string;
}

interface BulkSearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  matchCount: number;
  matches?: Array<{
    index: number;
    before: string;
    match: string;
    after: string;
    fullContext: string;
  }>;
  // 🆕 新しいプロパティ
  firstMatchIsLinked?: boolean;
  status?: "ready" | "already_linked";
  linkedText?: string;
  preview?: {
    originalLength: number;
    newLength: number;
    changeCount: number;
    // 🆕 リンク済み用のプロパティ
    alreadyLinked?: boolean;
    message?: string;
    matchDetails?: {
      originalText: string;
      replacementText: string;
      position: number;
      beforeContext: string;
      afterContext: string;
      fullContext: string;
    };
  };
}

interface ReplaceResult {
  success: boolean;
  message: string;
  affectedArticles: number;
  totalChanges: number;
  searchTerm: string;
  replaceTerm: string;
  timestamp: string;
  error?: string;
  // 🆕 新しいプロパティ
  skippedArticles?: number;
  alreadyLinkedCount?: number;
  changes: Array<{
    articleId: string;
    title: string;
    slug: string;
    changeCount: number;
    editUrl: string;
    previewUrl: string;
  }>;
}

export default function AdminDashboardContent() {
  // 既存の状態
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
  const [searchType, setSearchType] = useState<"title" | "content" | "both">(
    "title"
  );

  // コンテンツ検索結果用の状態
  const [contentSearchResults, setContentSearchResults] = useState<{
    [key: string]: ContentMatch[];
  }>({});
  const [showContentMatches, setShowContentMatches] = useState<{
    [key: string]: boolean;
  }>({});

  // 一括置換機能用の状態
  const [showBulkReplace, setShowBulkReplace] = useState(false);
  const [bulkSearchTerm, setBulkSearchTerm] = useState("");
  const [bulkReplaceTerm, setBulkReplaceTerm] = useState("");
  const [bulkOptions, setBulkOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    category: "",
    publishedOnly: false,
    firstMatchOnly: true,
  });
  const [bulkResults, setBulkResults] = useState<BulkSearchResult[]>([]);
  const [bulkPreviewResults, setBulkPreviewResults] = useState<
    BulkSearchResult[]
  >([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStep, setBulkStep] = useState<"search" | "preview" | "execute">(
    "search"
  );

  // 置換結果の確認用状態
  const [replaceResult, setReplaceResult] = useState<ReplaceResult | null>(
    null
  );
  const [showReplaceResult, setShowReplaceResult] = useState(false);

  // URLパラメータ関連
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const supabase = createClientComponentClient();

  // 一括検索実行
  const handleBulkSearch = useCallback(async () => {
    if (!bulkSearchTerm.trim()) {
      setError("検索語句を入力してください");
      return;
    }

    setBulkLoading(true);
    setError("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bulk-search",
          query: bulkSearchTerm.trim(),
          options: {
            ...bulkOptions,
            includeContent: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBulkResults(data.results);
        setBulkStep("search");
        setBulkPreviewResults([]);
      } else {
        setError(data.error || "一括検索に失敗しました");
      }
    } catch (error) {
      setError("一括検索中にエラーが発生しました");
      console.error("Bulk search error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [bulkSearchTerm, bulkOptions]);

  // 一括置換プレビュー
  const handleBulkPreview = useCallback(async () => {
    if (!bulkReplaceTerm && bulkReplaceTerm !== "") {
      setError("置換語句を入力してください");
      return;
    }

    setBulkLoading(true);
    setError("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bulk-preview",
          query: bulkSearchTerm.trim(),
          replaceTerm: bulkReplaceTerm,
          options: bulkOptions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBulkPreviewResults(data.results);
        setBulkStep("preview");
      } else {
        setError(data.error || "プレビューに失敗しました");
      }
    } catch (error) {
      setError("プレビュー中にエラーが発生しました");
      console.error("Bulk preview error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [bulkSearchTerm, bulkReplaceTerm, bulkOptions]);

  // 一括置換実行
  const handleBulkExecute = useCallback(async () => {
    const readyCount = bulkPreviewResults.filter(
      (r) => r.status === "ready"
    ).length;
    const skipCount = bulkPreviewResults.filter(
      (r) => r.status === "already_linked"
    ).length;

    let confirmMessage = `${readyCount}件の記事で最初のマッチを置換します。\n\n「${bulkSearchTerm}」→「${bulkReplaceTerm}」\n\n`;

    if (skipCount > 0) {
      confirmMessage += `${skipCount}件の記事は既にリンク化済みのためスキップされます。\n\n`;
    }

    confirmMessage += "この操作は元に戻すことが困難です。実行しますか？";

    if (!confirm(confirmMessage)) {
      return;
    }

    setBulkLoading(true);
    setError("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bulk-replace",
          query: bulkSearchTerm.trim(),
          replaceTerm: bulkReplaceTerm,
          options: bulkOptions,
        }),
      });

      const data: ReplaceResult = await response.json();

      if (response.ok) {
        setReplaceResult(data);
        setShowReplaceResult(true);
        setBulkStep("execute");

        // 置換セクションをリセット
        setBulkSearchTerm("");
        setBulkReplaceTerm("");
        setBulkResults([]);
        setBulkPreviewResults([]);
        setBulkStep("search");
        setShowBulkReplace(false);

        // 検索状態をリセットして記事一覧を自動的に再読み込み
        setSearchQuery("");
        setSearchInput("");
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        setError(data.error || "一括置換に失敗しました");
      }
    } catch (error) {
      setError("一括置換中にエラーが発生しました");
      console.error("Bulk execute error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [bulkSearchTerm, bulkReplaceTerm, bulkOptions, bulkPreviewResults]);

  // URLパラメータから初期状態を取得
  useEffect(() => {
    if (!initialMountRef.current) return;

    console.log("URLパラメータから状態を初期化中...");

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const searchTypeParam = searchParams.get("searchType");

    let stateChanged = false;
    let newCategoryValue = "";
    let newSearchValue = "";
    let newPage = 1;
    let newSearchType: "title" | "content" | "both" = "title";

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

    if (
      searchTypeParam &&
      ["title", "content", "both"].includes(searchTypeParam)
    ) {
      newSearchType = searchTypeParam as "title" | "content" | "both";
      stateChanged = true;
      console.log("検索タイプを検出:", searchTypeParam);
    }

    // 一括で状態を更新
    if (stateChanged) {
      console.log("検出したURLパラメータで状態を更新します");
      setSelectedCategory(newCategoryValue);
      setSearchQuery(newSearchValue);
      setSearchInput(newSearchValue);
      setSearchType(newSearchType);
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
      params.append("searchType", searchType);
    }

    if (pagination.page > 1) {
      params.append("page", pagination.page.toString());
    }

    // URLを更新（ページリロードなし）
    const url = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(url, { scroll: false });
  }, [
    pathname,
    router,
    selectedCategory,
    searchQuery,
    searchType,
    pagination.page,
  ]);

  // 状態変更時にURLを更新
  useEffect(() => {
    if (!initialMountRef.current) {
      updateUrlParams();
    }
  }, [
    selectedCategory,
    searchQuery,
    searchType,
    pagination.page,
    updateUrlParams,
  ]);

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
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 検索タイプ変更時の処理
  const handleSearchTypeChange = (newType: "title" | "content" | "both") => {
    setSearchType(newType);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 検索実行関数
  const handleSearch = (): void => {
    const trimmedQuery = searchInput.trim();
    console.log("検索実行:", trimmedQuery, "タイプ:", searchType);
    setSearchQuery(trimmedQuery);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 検索リセット関数
  const resetSearch = (): void => {
    console.log("検索リセット");
    setSearchInput("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Enter キーで検索を実行
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // コンテンツマッチを取得する関数
  const getContentMatches = async (
    articleId: string,
    query: string
  ): Promise<ContentMatch[]> => {
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "highlight",
          query,
          articleId,
          type: "article",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.matches || [];
      }
    } catch (error) {
      console.error("Content matches error:", error);
    }
    return [];
  };

  // コンテンツマッチを表示/非表示する関数
  const toggleContentMatches = async (articleId: string) => {
    const isCurrentlyShown = showContentMatches[articleId];

    if (!isCurrentlyShown && searchQuery && searchType !== "title") {
      const matches = await getContentMatches(articleId, searchQuery);
      setContentSearchResults((prev) => ({
        ...prev,
        [articleId]: matches,
      }));
    }

    setShowContentMatches((prev) => ({
      ...prev,
      [articleId]: !isCurrentlyShown,
    }));
  };

  // 編集リンクを生成する関数
  const getEditLink = (slug: string): string => {
    const params = new URLSearchParams();
    params.append("returnPath", pathname);
    if (selectedCategory) params.append("category", selectedCategory);
    if (searchQuery) {
      params.append("search", searchQuery);
      params.append("searchType", searchType);
    }
    if (pagination.page > 1) params.append("page", pagination.page.toString());
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
        searchType: searchType,
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
            queryParams.append("searchType", searchType);
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
    } catch (error: unknown) {
      console.error("データ取得エラー:", error);
      setError(
        error instanceof Error
          ? error.message
          : "データの読み込みに失敗しました"
      );
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
    searchType,
    supabase,
  ]);

  // 初期データ読み込みとフィルター変更時の再取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 記事の特集画像を取得するヘルパー関数
  const getFeaturedImage = (article: Article): ArticleImage | null => {
    if (article.images && article.images.length > 0) {
      const featuredImage = article.images.find((img) => img.isFeatured);
      if (featuredImage) return featuredImage;
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
    return html.replace(/<[^>]*>/g, "");
  };

  // 記事カードコンポーネント
  const ArticleCard = ({ article }: { article: Article }) => {
    const featuredImage = getFeaturedImage(article);
    const plainContent = getPlainTextFromHtml(article.content);
    const excerptContent =
      plainContent.length > 100
        ? `${plainContent.substring(0, 100)}...`
        : plainContent;

    const hasContentSearch =
      searchQuery && (searchType === "content" || searchType === "both");

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
                className="object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                <p className="text-gray-500 text-sm">画像なし</p>
              </div>
            )}
          </div>

          {/* 記事情報 - 右側 */}
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-1">{article.title}</h3>
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
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    article.published
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {article.published ? "公開中" : "下書き"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 編集ページへのリンクを動的に生成 */}
              <Link href={getEditLink(article.slug)}>
                <Button variant="outline" size="sm" className="text-sm py-1">
                  記事を編集
                </Button>
              </Link>

              {/* コンテンツマッチ表示ボタン */}
              {hasContentSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleContentMatches(article.id)}
                  className="text-sm py-1"
                >
                  {showContentMatches[article.id]
                    ? "マッチを隠す"
                    : "マッチを表示"}
                </Button>
              )}
            </div>

            {/* コンテンツマッチ表示エリア */}
            {showContentMatches[article.id] &&
              contentSearchResults[article.id] && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-sm mb-2">
                    検索キーワード &quot;{searchQuery}&quot; のマッチ:
                  </h4>
                  {contentSearchResults[article.id].length > 0 ? (
                    contentSearchResults[article.id].map(
                      (match: ContentMatch, index: number) => (
                        <div
                          key={index}
                          className="text-sm mb-2 p-2 bg-white rounded border"
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: match.highlighted,
                            }}
                            className="[&_mark]:bg-yellow-300 [&_mark]:font-bold [&_mark]:px-1"
                          />
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-gray-600">
                      マッチするコンテンツが見つかりませんでした。
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 🆕 置換結果確認モーダル */}
      {showReplaceResult && replaceResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-green-800">
                  ✅ 一括置換が完了しました
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowReplaceResult(false)}
                  className="text-gray-500"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">実行結果</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">置換実行:</span>
                      <span className="ml-2 text-green-600 font-bold">
                        {replaceResult.affectedArticles}件
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">置換箇所:</span>
                      <span className="ml-2">
                        {replaceResult.totalChanges}箇所
                      </span>
                    </div>
                    {replaceResult.skippedArticles &&
                      replaceResult.skippedArticles > 0 && (
                        <div>
                          <span className="font-medium">スキップ:</span>
                          <span className="ml-2 text-blue-600">
                            {replaceResult.skippedArticles}件
                          </span>
                        </div>
                      )}
                    <div>
                      <span className="font-medium">検索語:</span>
                      <code className="ml-2 bg-gray-100 px-1 rounded">
                        {replaceResult.searchTerm}
                      </code>
                    </div>
                  </div>
                  {replaceResult.skippedArticles &&
                    replaceResult.skippedArticles > 0 && (
                      <div className="mt-3 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        <span className="font-medium">
                          📌 スキップについて:
                        </span>
                        <br />
                        {replaceResult.alreadyLinkedCount ||
                          replaceResult.skippedArticles}
                        件の記事は、
                        検索ワードが既にマークダウンリンクとして使用されているため、
                        置換をスキップしました。
                      </div>
                    )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">更新された記事一覧</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {replaceResult.changes.map((change) => (
                      <div
                        key={change.articleId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-grow">
                          <span className="font-medium">{change.title}</span>
                          <span className="text-gray-600 text-sm ml-2">
                            (最初のマッチ1箇所を置換)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={change.editUrl}>
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                          </Link>
                          <Link href={change.previewUrl} target="_blank">
                            <Button variant="outline" size="sm">
                              プレビュー
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">💡 確認のヒント</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 「編集」ボタンで各記事の内容を確認・修正できます</li>
                    <li>
                      • 「プレビュー」ボタンで本番サイトでの表示を確認できます
                    </li>
                    <li>• 置換は各記事で最初に見つかった箇所のみです</li>
                    <li>
                      • 万が一間違いがあった場合は、個別に編集してください
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">記事管理</h2>
        <div className="flex gap-3">
          <Button
            variant={showBulkReplace ? "default" : "outline"}
            onClick={() => setShowBulkReplace(!showBulkReplace)}
            className="flex items-center gap-2"
          >
            <Replace className="h-4 w-4" />
            一括置換
          </Button>
          <Link href="/admin/messages">
            <Button variant="outline">お問い合わせ一覧</Button>
          </Link>
          <Link href="/admin/category-item">
            <Button variant="outline">カテゴリ項目管理</Button>
          </Link>
          <Link href="/admin/articles/new">
            <Button>新規記事作成</Button>
          </Link>
        </div>
      </div>

      {/* 一括置換セクション */}
      {showBulkReplace && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">
              一括検索・置換
            </h3>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-4">
            {/* 検索・置換入力 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  検索語句 *
                </label>
                <Input
                  value={bulkSearchTerm}
                  onChange={(e) => setBulkSearchTerm(e.target.value)}
                  placeholder="置換したい文字列を入力..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  置換語句
                </label>
                <Input
                  value={bulkReplaceTerm}
                  onChange={(e) => setBulkReplaceTerm(e.target.value)}
                  placeholder="新しい文字列を入力..."
                  className="w-full"
                />
              </div>
            </div>

            {/* オプション */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">オプション</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bulkOptions.caseSensitive}
                    onChange={(e) =>
                      setBulkOptions((prev) => ({
                        ...prev,
                        caseSensitive: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">大文字小文字を区別</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bulkOptions.wholeWord}
                    onChange={(e) =>
                      setBulkOptions((prev) => ({
                        ...prev,
                        wholeWord: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">単語単位で検索</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bulkOptions.publishedOnly}
                    onChange={(e) =>
                      setBulkOptions((prev) => ({
                        ...prev,
                        publishedOnly: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">公開記事のみ</span>
                </label>
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  <span>📌 最初のマッチのみ置換（リンク済みは除外）</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2">
              <Button
                onClick={handleBulkSearch}
                disabled={!bulkSearchTerm.trim() || bulkLoading}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {bulkLoading && bulkStep === "search" ? "検索中..." : "検索"}
              </Button>

              {bulkResults.length > 0 && (
                <Button
                  onClick={handleBulkPreview}
                  disabled={
                    (!bulkReplaceTerm && bulkReplaceTerm !== "") || bulkLoading
                  }
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {bulkLoading && bulkStep === "preview"
                    ? "プレビュー中..."
                    : "プレビュー"}
                </Button>
              )}

              {bulkPreviewResults.length > 0 && (
                <Button
                  onClick={handleBulkExecute}
                  disabled={bulkLoading}
                  variant="default"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4" />
                  {bulkLoading && bulkStep === "execute" ? "実行中..." : "実行"}
                </Button>
              )}
            </div>

            {/* 検索結果表示 */}
            {bulkResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">
                  検索結果: {bulkResults.length}件の記事
                  {bulkResults.filter((r) => r.status === "ready").length >
                    0 && (
                    <span className="text-green-600 ml-2">
                      (置換可能:{" "}
                      {bulkResults.filter((r) => r.status === "ready").length}
                      件)
                    </span>
                  )}
                  {bulkResults.filter((r) => r.status === "already_linked")
                    .length > 0 && (
                    <span className="text-blue-600 ml-2">
                      (置換済み:{" "}
                      {
                        bulkResults.filter((r) => r.status === "already_linked")
                          .length
                      }
                      件)
                    </span>
                  )}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {bulkResults.slice(0, 10).map((result) => (
                    <div
                      key={result.id}
                      className={`text-sm p-2 rounded flex items-center justify-between ${
                        result.status === "already_linked"
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{result.title}</span>
                        <span className="text-gray-600 ml-2">
                          {result.status === "already_linked"
                            ? "(最初のマッチは既にリンク済み)"
                            : `(${result.matchCount}箇所)`}
                        </span>
                      </div>
                      {result.status === "already_linked" && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          置換済み
                        </span>
                      )}
                    </div>
                  ))}
                  {bulkResults.length > 10 && (
                    <div className="text-sm text-gray-600 p-2">
                      ...他 {bulkResults.length - 10} 件
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* プレビュー結果表示 */}
            {bulkPreviewResults.length > 0 && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium text-orange-700">
                  置換プレビュー:
                  <span className="text-green-600 ml-2">
                    置換実行:{" "}
                    {
                      bulkPreviewResults.filter((r) => r.status === "ready")
                        .length
                    }
                    件
                  </span>
                  {bulkPreviewResults.filter(
                    (r) => r.status === "already_linked"
                  ).length > 0 && (
                    <span className="text-blue-600 ml-2">
                      スキップ:{" "}
                      {
                        bulkPreviewResults.filter(
                          (r) => r.status === "already_linked"
                        ).length
                      }
                      件
                    </span>
                  )}
                </h4>

                <div className="max-h-80 overflow-y-auto space-y-3">
                  {bulkPreviewResults.map((result) => (
                    <div
                      key={result.id}
                      className={`border rounded-lg p-4 ${
                        result.status === "already_linked"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-medium text-lg">
                            {result.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            {result.status === "already_linked" ? (
                              <>
                                <span className="text-blue-700 text-sm">
                                  🔗 最初のマッチは既にリンク化済み
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  スキップ
                                </span>
                              </>
                            ) : (
                              <span className="text-orange-700 text-sm">
                                ✏️ 最初のマッチを置換
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={getEditLink(result.slug)}>
                          <Button variant="outline" size="sm">
                            編集ページで確認
                          </Button>
                        </Link>
                      </div>

                      {result.status === "already_linked" ? (
                        <div className="bg-white border rounded p-3 text-sm">
                          <div className="mb-2">
                            <span className="font-medium">
                              既存のリンク情報:
                            </span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            <span className="text-gray-600">
                              最初に見つかった「{bulkSearchTerm}
                              」は既にマークダウンリンクとして使用されています。
                            </span>
                            {result.linkedText && (
                              <div className="mt-1">
                                <span className="font-medium">
                                  リンクテキスト:{" "}
                                </span>
                                <code className="bg-white px-1 rounded">
                                  {result.linkedText}
                                </code>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            この記事は既に手動でリンク化済みのため、置換をスキップします。
                          </div>
                        </div>
                      ) : (
                        result.preview?.matchDetails && (
                          <div className="bg-white border rounded p-3 text-sm">
                            <div className="mb-2">
                              <span className="font-medium">
                                置換箇所のコンテキスト:
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                              <span className="text-gray-600">
                                {result.preview.matchDetails.beforeContext}
                              </span>
                              <span className="bg-red-200 px-1 rounded">
                                {result.preview.matchDetails.originalText}
                              </span>
                              <span className="text-gray-600">
                                {result.preview.matchDetails.afterContext}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              位置: {result.preview.matchDetails.position}文字目
                            </div>
                            <div className="mt-2">
                              <span className="font-medium">置換後:</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                              <span className="text-gray-600">
                                {result.preview.matchDetails.beforeContext}
                              </span>
                              <span className="bg-green-200 px-1 rounded">
                                {result.preview.matchDetails.replacementText}
                              </span>
                              <span className="text-gray-600">
                                {result.preview.matchDetails.afterContext}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        <div className="space-y-3">
          {/* 検索タイプ選択 */}
          <div className="flex items-center gap-4">
            <span className="font-medium">検索対象:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={searchType === "title" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSearchTypeChange("title")}
              >
                タイトルのみ
              </Button>
              <Button
                variant={searchType === "content" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSearchTypeChange("content")}
              >
                本文のみ
              </Button>
              <Button
                variant={searchType === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSearchTypeChange("both")}
              >
                タイトル・本文両方
              </Button>
            </div>
          </div>

          {/* 検索入力フィールド */}
          <div className="flex items-center gap-2">
            <div className="flex-grow flex items-center gap-2">
              <span className="font-medium">
                {searchType === "title"
                  ? "タイトル検索:"
                  : searchType === "content"
                  ? "コンテンツ検索:"
                  : "キーワード検索:"}
              </span>
              <Input
                type="text"
                placeholder={
                  searchType === "title"
                    ? "記事タイトルでキーワード検索..."
                    : searchType === "content"
                    ? "記事本文でキーワード検索..."
                    : "タイトル・本文でキーワード検索..."
                }
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
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
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
                  <span>
                    検索: &quot;{searchQuery}&quot; ({searchType})
                  </span>
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
              articles.map((article: Article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <p className="col-span-full text-center py-12 text-base">
                {selectedCategory || searchQuery
                  ? `条件に一致する記事がありません。${
                      selectedCategory
                        ? `カテゴリー「${selectedCategory}」`
                        : ""
                    }${selectedCategory && searchQuery ? "、" : ""}${
                      searchQuery
                        ? `検索キーワード「${searchQuery}」(${searchType})`
                        : ""
                    }`
                  : "記事がありません。新しい記事を作成してください。"}
              </p>
            )}
          </div>

          {/* ページネーション */}
          {pagination.pageCount > 1 && (
            <ImprovedPagination
              currentPage={pagination.page}
              totalPages={pagination.pageCount}
              onPageChange={changePage}
            />
          )}
        </>
      )}
    </div>
  );
}
