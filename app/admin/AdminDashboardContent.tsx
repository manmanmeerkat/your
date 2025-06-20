"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ImprovedPagination } from "@/components/ui/improved-pagination";
import {
  Search,
  Replace,
  Eye,
  Play,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

// 🆕 一口メモ関連の型定義
export interface ArticleTrivia {
  id: string;
  title: string;
  content: string;
  contentEn?: string | null;
  category: string;
  tags: string[];
  iconEmoji?: string | null;
  colorTheme?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  articleId: string;
}

// 🔧 既存のArticle型に一口メモを追加
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
  trivia?: ArticleTrivia[];
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
  firstMatchIsLinked?: boolean;
  status?: "ready" | "already_linked";
  linkedText?: string;
  preview?: {
    originalLength: number;
    newLength: number;
    changeCount: number;
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

// 🆕 一口メモのカテゴリー定数
const TRIVIA_CATEGORIES = {
  SHRINE: "shrine",
  ANIME: "anime",
  FOOD: "food",
  CULTURE: "culture",
  HISTORY: "history",
  NATURE: "nature",
  FESTIVAL: "festival",
  MYTHOLOGY: "mythology",
  CUSTOMS: "customs",
  DEFAULT: "default",
} as const;

// 🆕 一口メモフォーム用の型
interface TriviaFormData {
  id?: string;
  title: string;
  content: string;
  category: string;
  iconEmoji?: string;
  isActive: boolean;
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

  // 🆕 一口メモ管理用の状態
  const [expandedTrivia, setExpandedTrivia] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingTrivia, setEditingTrivia] = useState<{
    [key: string]: string | null;
  }>({});
  const [editingTriviaData, setEditingTriviaData] = useState<{
    [key: string]: TriviaFormData;
  }>({});
  const [triviaLoading, setTriviaLoading] = useState<{
    [key: string]: boolean;
  }>({});

  // 🔍 デバッグ用の状態
  // const [debugMode, setDebugMode] = useState(false);

  // URLパラメータ関連
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // 🛠️ DebugControlsコンポーネントの完全版（Part 7から抜粋・修正）
  // この部分をPart 2の状態管理セクションの後に追加してください

  // フォーマット関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`;
  };

  const getPlainTextFromHtml = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  // 🆕 一口メモ関連の関数

  // 一口メモセクションの展開/折りたたみ
  const toggleTriviaSection = (articleId: string) => {
    setExpandedTrivia((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // 新しい一口メモの作成フォームを表示
  const startCreatingTrivia = (articleId: string) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [articleId]: "new",
    }));

    setEditingTriviaData((prev) => ({
      ...prev,
      [articleId]: {
        title: "",
        content: "",
        category: TRIVIA_CATEGORIES.DEFAULT,
        iconEmoji: "",
        isActive: true,
      },
    }));
  };

  // 既存の一口メモの編集フォームを表示
  const startEditingTrivia = (articleId: string, trivia: ArticleTrivia) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [articleId]: trivia.id,
    }));

    setEditingTriviaData((prev) => ({
      ...prev,
      [articleId]: {
        id: trivia.id,
        title: trivia.title,
        content: trivia.content,
        category: trivia.category,
        iconEmoji: trivia.iconEmoji || "",
        isActive: trivia.isActive,
      },
    }));
  };

  // 一口メモ編集をキャンセル
  const cancelEditingTrivia = useCallback((articleId: string) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [articleId]: null,
    }));

    setEditingTriviaData((prev) => {
      const newData = { ...prev };
      delete newData[articleId];
      return newData;
    });
  }, []);

  // 一口メモフォームデータ更新
  const updateTriviaData = useCallback(
    (
      articleId: string,
      field: keyof TriviaFormData,
      value: string | boolean
    ) => {
      setEditingTriviaData((prev) => ({
        ...prev,
        [articleId]: {
          ...prev[articleId],
          [field]: value,
        },
      }));
    },
    []
  );

  // 🔧 一口メモ保存処理の改善
  const saveTrivia = useCallback(
    async (articleId: string) => {
      const data = editingTriviaData[articleId];
      if (!data || !data.content.trim()) {
        setError("内容は必須です");
        return;
      }

      setTriviaLoading((prev) => ({ ...prev, [articleId]: true }));

      try {
        const isNew = editingTrivia[articleId] === "new";
        const url = isNew
          ? `/api/trivia/article/${articleId}`
          : `/api/trivia/${data.id}`;

        const method = isNew ? "POST" : "PUT";

        console.log(`一口メモ${isNew ? "作成" : "更新"}開始:`, {
          url,
          method,
          data: {
            title: data.title.trim(),
            content: data.content.trim(),
            category: data.category,
            iconEmoji: data.iconEmoji?.trim() || null,
            isActive: data.isActive,
          },
        });

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: data.title.trim(),
            content: data.content.trim(),
            category: data.category,
            iconEmoji: data.iconEmoji?.trim() || null,
            isActive: data.isActive,
          }),
        });

        if (response.ok) {
          const savedData = await response.json();
          console.log("一口メモ保存成功:", savedData);

          // 成功時は記事データを再取得
          // await fetchData(); // fetchDataが定義される前に使用されているため削除

          // 代わりに直接APIを呼び出してデータを再取得
          const refreshResponse = await fetch(
            `/api/articles?page=${pagination.page}&pageSize=${
              pagination.pageSize
            }&includeImages=true&includeTrivia=true&includeTriviaDetails=true${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${
              searchQuery
                ? `&search=${searchQuery}&searchType=${searchType}`
                : ""
            }`,
            {
              credentials: "include",
            }
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.articles) {
              setArticles(refreshData.articles);
              if (refreshData.pagination) {
                setPagination(refreshData.pagination);
              }
            }
          }

          // 編集状態をリセット
          cancelEditingTrivia(articleId);

          // 一口メモセクションを展開状態にする
          setExpandedTrivia((prev) => ({
            ...prev,
            [articleId]: true,
          }));

          setError(null);
        } else {
          const errorData = await response.json();
          console.error("一口メモ保存エラー:", errorData);
          setError(errorData.error || "一口メモの保存に失敗しました");
        }
      } catch (error) {
        console.error("一口メモ保存エラー:", error);
        setError("一口メモの保存中にエラーが発生しました");
      } finally {
        setTriviaLoading((prev) => ({ ...prev, [articleId]: false }));
      }
    },
    [
      editingTriviaData,
      editingTrivia,
      pagination.page,
      pagination.pageSize,
      selectedCategory,
      searchQuery,
      searchType,
    ]
  );

  // 🔧 一口メモ削除処理の改善
  const deleteTrivia = async (articleId: string, triviaId: string) => {
    if (!confirm("この一口メモを削除しますか？")) {
      return;
    }

    setTriviaLoading((prev) => ({ ...prev, [articleId]: true }));

    try {
      console.log("一口メモ削除開始:", { articleId, triviaId });

      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        console.log("一口メモ削除成功");
        // 成功時は記事データを再取得
        await fetchData();
        setError(null);
      } else {
        const errorData = await response.json();
        console.error("一口メモ削除エラー:", errorData);
        setError(errorData.error || "一口メモの削除に失敗しました");
      }
    } catch (error) {
      console.error("一口メモ削除エラー:", error);
      setError("一口メモの削除中にエラーが発生しました");
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // 🔧 一口メモの順序変更処理の改善
  const reorderTrivia = async (
    articleId: string,
    triviaId: string,
    direction: "up" | "down"
  ) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article || !article.trivia) return;

    const currentIndex = article.trivia.findIndex((t) => t.id === triviaId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= article.trivia.length) return;

    setTriviaLoading((prev) => ({ ...prev, [articleId]: true }));

    try {
      console.log("一口メモ順序変更開始:", {
        articleId,
        triviaId,
        direction,
        currentIndex,
        newIndex,
      });

      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          displayOrder: newIndex,
        }),
      });

      if (response.ok) {
        console.log("一口メモ順序変更成功");
        await fetchData();
        setError(null);
      } else {
        const errorData = await response.json();
        console.error("順序変更エラー:", errorData);
        setError(errorData.error || "順序の変更に失敗しました");
      }
    } catch (error) {
      console.error("順序変更エラー:", error);
      setError("順序の変更中にエラーが発生しました");
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // 📊 データ取得関数を一口メモ対応に修正
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

        // 記事取得（一口メモを含む）
        (async () => {
          const queryParams = new URLSearchParams();
          queryParams.append("page", pagination.page.toString());
          queryParams.append("pageSize", pagination.pageSize.toString());
          queryParams.append("includeImages", "true");
          queryParams.append("includeTrivia", "true"); // 🆕 一口メモを含める
          queryParams.append("includeTriviaDetails", "true"); // 🆕 一口メモの詳細情報も含める

          if (selectedCategory) {
            queryParams.append("category", selectedCategory);
          }

          if (searchQuery) {
            queryParams.append("search", searchQuery);
            queryParams.append("searchType", searchType);
          }

          const apiUrl = `/api/articles?${queryParams.toString()}`;
          console.log("記事取得API呼び出し:", apiUrl);

          return fetch(apiUrl, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
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
        const errorText = await articlesResponse.text();
        console.error("記事取得エラーレスポンス:", errorText);
        throw new Error(
          `記事取得エラー: ${articlesResponse.status} - ${errorText}`
        );
      }

      const articlesData = await articlesResponse.json();
      console.log("記事データ取得成功:", articlesData);

      if (articlesData.articles) {
        // 一口メモデータの存在確認とログ出力
        articlesData.articles.forEach((article: Article) => {
          if (article.trivia && article.trivia.length > 0) {
            console.log(
              `記事 "${article.title}" の一口メモ:`,
              article.trivia.length,
              "件"
            );
            article.trivia.forEach(
              (trivia: ArticleTrivia, triviaIndex: number) => {
                console.log(`  - 一口メモ ${triviaIndex + 1}:`, {
                  id: trivia.id,
                  title: trivia.title,
                  contentLength: trivia.content.length,
                  isActive: trivia.isActive,
                  category: trivia.category,
                });
              }
            );
          } else {
            console.log(`記事 "${article.title}": 一口メモなし`);
          }
        });

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

  // 既存の一括検索・置換関数群
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

        setBulkSearchTerm("");
        setBulkReplaceTerm("");
        setBulkResults([]);
        setBulkPreviewResults([]);
        setBulkStep("search");
        setShowBulkReplace(false);

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

  const changePage = (newPage: number): void => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleCategoryChange = (category: string): void => {
    console.log("カテゴリー変更:", category);
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchTypeChange = (newType: "title" | "content" | "both") => {
    setSearchType(newType);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (): void => {
    const trimmedQuery = searchInput.trim();
    console.log("検索実行:", trimmedQuery, "タイプ:", searchType);
    setSearchQuery(trimmedQuery);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetSearch = (): void => {
    console.log("検索リセット");
    setSearchInput("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🆕 一口メモ表示コンポーネント（管理画面用・完全修正版）
  const TriviaDisplay = ({
    articleId,
    trivia,
    index,
  }: {
    articleId: string;
    trivia: ArticleTrivia;
    index: number;
  }) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const [isMarkdownReady, setIsMarkdownReady] = useState(false);

    useEffect(() => {
      // マークダウンレンダリングの準備完了を示す
      setIsMarkdownReady(true);
    }, []);

    // 短縮版コンテンツ（マークダウン記法を除去してプレーンテキスト化）
    const getPlainText = (content: string) => {
      return content
        .replace(/#{1,6}\s+/g, "") // 見出し記号を削除
        .replace(/\*\*(.*?)\*\*/g, "$1") // 太字記号を削除
        .replace(/\*(.*?)\*/g, "$1") // 斜体記号を削除
        .replace(/`(.*?)`/g, "$1") // コード記号を削除
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // リンク記号を削除
        .replace(/<[^>]*>/g, "") // HTMLタグを削除
        .replace(/\n+/g, " ") // 改行を空白に変換
        .trim();
    };

    const plainText = getPlainText(trivia.content);
    const shouldTruncate = plainText.length > 100;
    const truncatedText = shouldTruncate
      ? `${plainText.substring(0, 100)}...`
      : plainText;

    // 簡易マークダウンレンダリング関数（管理画面用）
    const renderSimpleMarkdown = (content: string) => {
      if (!content) return "";

      return content.split("\n").map((line, lineIndex) => {
        // 太字の処理
        const processedLine = line
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-bold text-gray-800">$1</strong>'
          )
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
          .replace(
            /`(.*?)`/g,
            '<code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>'
          )
          .replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
          );

        return (
          <p
            key={lineIndex}
            className="text-gray-700 leading-relaxed mb-2 last:mb-0 text-sm"
          >
            <span dangerouslySetInnerHTML={{ __html: processedLine }} />
          </p>
        );
      });
    };

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            {/* ヘッダー情報 */}
            <div className="flex items-center gap-2 mb-2">
              {trivia.iconEmoji && (
                <div className="flex items-center gap-1">
                  <img
                    src={trivia.iconEmoji}
                    alt="trivia icon"
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-xs text-gray-500">
                    カスタムアイコン
                  </span>
                </div>
              )}
              <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full">
                💡 {trivia.title}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {trivia.category}
              </span>
              {trivia.tags.length > 0 && (
                <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                  {trivia.tags.slice(0, 2).join(", ")}
                  {trivia.tags.length > 2 && " ..."}
                </span>
              )}
            </div>

            {/* コンテンツ表示 */}
            <div className="text-sm text-gray-700 mb-1">
              {showFullContent ? (
                // フルマークダウンレンダリング
                <div className="trivia-markdown-content space-y-2">
                  {isMarkdownReady ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        // 段落のスタイル（管理画面用に小さめ）
                        p: ({ children, ...props }) => (
                          <p
                            className="text-gray-700 leading-relaxed mb-2 last:mb-0 text-sm"
                            {...props}
                          >
                            {children}
                          </p>
                        ),

                        // 見出しのスタイル（管理画面用に小さめ）
                        h1: ({ children, ...props }) => (
                          <h1
                            className="text-base font-bold text-gray-800 mb-2 mt-3 first:mt-0"
                            {...props}
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children, ...props }) => (
                          <h2
                            className="text-sm font-semibold text-gray-800 mb-2 mt-2 first:mt-0"
                            {...props}
                          >
                            {children}
                          </h2>
                        ),
                        h3: ({ children, ...props }) => (
                          <h3
                            className="text-sm font-semibold text-gray-700 mb-1 mt-2 first:mt-0"
                            {...props}
                          >
                            {children}
                          </h3>
                        ),

                        // 太字のスタイル
                        strong: ({ children, ...props }) => (
                          <strong
                            className="font-bold text-gray-800"
                            {...props}
                          >
                            {children}
                          </strong>
                        ),

                        // 斜体のスタイル
                        em: ({ children, ...props }) => (
                          <em className="italic text-gray-700" {...props}>
                            {children}
                          </em>
                        ),

                        // リンクのスタイル
                        a: ({ children, href, ...props }) => (
                          <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),

                        // インラインコードのスタイル
                        code: (props) => {
                          const { children, className, ...restProps } =
                            props as React.ComponentProps<"code"> & {
                              className?: string;
                            };
                          const match = /language-(\w+)/.exec(className || "");

                          if (!match) {
                            // インラインコード
                            return (
                              <code
                                className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono"
                                {...restProps}
                              >
                                {children}
                              </code>
                            );
                          }

                          // コードブロック
                          return (
                            <code
                              className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto my-2"
                              {...restProps}
                            >
                              {children}
                            </code>
                          );
                        },

                        // コードブロックのスタイル
                        pre: ({ children, ...props }) => (
                          <pre
                            className="bg-gray-100 border border-gray-200 rounded p-2 my-2 overflow-x-auto text-xs"
                            {...props}
                          >
                            {children}
                          </pre>
                        ),

                        // リストのスタイル
                        ul: ({ children, ...props }) => (
                          <ul
                            className="list-disc list-inside text-gray-700 space-y-1 my-2 pl-3 text-sm"
                            {...props}
                          >
                            {children}
                          </ul>
                        ),

                        ol: ({ children, ...props }) => (
                          <ol
                            className="list-decimal list-inside text-gray-700 space-y-1 my-2 pl-3 text-sm"
                            {...props}
                          >
                            {children}
                          </ol>
                        ),

                        li: ({ children, ...props }) => (
                          <li className="text-gray-700 text-sm" {...props}>
                            {children}
                          </li>
                        ),

                        // 引用のスタイル
                        blockquote: ({ children, ...props }) => (
                          <blockquote
                            className="border-l-4 border-blue-400 bg-blue-50 pl-3 py-2 my-2 italic text-gray-700 text-sm"
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),

                        // 水平線
                        hr: (props) => (
                          <hr className="border-gray-300 my-3" {...props} />
                        ),
                      }}
                    >
                      {trivia.content}
                    </ReactMarkdown>
                  ) : (
                    // フォールバック表示
                    <div className="space-y-2">
                      {renderSimpleMarkdown(trivia.content)}
                    </div>
                  )}
                </div>
              ) : (
                // 短縮表示（プレーンテキスト）
                <div className="line-clamp-3 text-sm">{truncatedText}</div>
              )}
            </div>

            {/* 展開/折りたたみボタン */}
            {shouldTruncate && (
              <Button
                onClick={() => setShowFullContent(!showFullContent)}
                variant="ghost"
                size="sm"
                className="text-xs p-1 h-auto mb-2 text-blue-600 hover:text-blue-800"
              >
                {showFullContent ? "折りたたむ" : "全文表示（マークダウン）"}
              </Button>
            )}

            {/* 英語コンテンツ */}
            {trivia.contentEn && (
              <div className="text-xs text-gray-600 mt-2 p-2 bg-white bg-opacity-50 rounded">
                <strong>English:</strong>
                <div className="mt-1">
                  {showFullContent && isMarkdownReady ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children, ...props }) => (
                          <p
                            className="text-xs text-gray-600 mb-1 last:mb-0"
                            {...props}
                          >
                            {children}
                          </p>
                        ),
                        strong: ({ children, ...props }) => (
                          <strong className="font-semibold" {...props}>
                            {children}
                          </strong>
                        ),
                        em: ({ children, ...props }) => (
                          <em className="italic" {...props}>
                            {children}
                          </em>
                        ),
                        a: ({ children, href, ...props }) => (
                          <a
                            href={href}
                            className="text-blue-600 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {trivia.contentEn}
                    </ReactMarkdown>
                  ) : (
                    <div className="text-xs">
                      {getPlainText(trivia.contentEn).substring(0, 80)}
                      {getPlainText(trivia.contentEn).length > 80 && "..."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 作成日時・更新日時 */}
            <div className="text-xs text-gray-500 mt-2 flex gap-3">
              <span>作成: {formatDate(trivia.createdAt)}</span>
              <span>更新: {formatDate(trivia.updatedAt)}</span>
              <span
                className={`px-2 py-1 rounded-full ${
                  trivia.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {trivia.isActive ? "アクティブ" : "非アクティブ"}
              </span>
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="flex items-center gap-1 ml-2">
            {index > 0 && (
              <Button
                onClick={() => reorderTrivia(articleId, trivia.id, "up")}
                disabled={triviaLoading[articleId]}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="上に移動"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}

            <Button
              onClick={() => startEditingTrivia(articleId, trivia)}
              disabled={triviaLoading[articleId]}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="編集"
            >
              <Edit className="h-3 w-3" />
            </Button>

            <Button
              onClick={() => deleteTrivia(articleId, trivia.id)}
              disabled={triviaLoading[articleId]}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="削除"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  // 🆕 一口メモセクションコンポーネント（改善版）
  const TriviaSection = ({
    article,
    expandedTrivia,
    editingTrivia,
    triviaLoading,
    toggleTriviaSection,
    startCreatingTrivia,
  }: {
    article: Article;
    expandedTrivia: { [key: string]: boolean };
    editingTrivia: { [key: string]: string | null };
    triviaLoading: { [key: string]: boolean };
    toggleTriviaSection: (articleId: string) => void;
    startCreatingTrivia: (articleId: string) => void;
  }) => {
    const isExpanded = expandedTrivia[article.id];
    const isEditing = editingTrivia[article.id];

    // 一口メモの数を正確にカウント
    const activeTriviaCount =
      article.trivia?.filter((t) => t.isActive).length || 0;
    const totalTriviaCount = article.trivia?.length || 0;

    // デバッグ情報をコンソールに出力
    useEffect(() => {
      if (article.trivia && article.trivia.length > 0) {
        console.log(`TriviaSection for article "${article.title}":`, {
          totalTrivia: article.trivia.length,
          activeTrivia: activeTriviaCount,
          triviaList: article.trivia.map((t) => ({
            id: t.id,
            title: t.title,
            isActive: t.isActive,
            contentLength: t.content.length,
          })),
        });
      }
    }, [article.trivia, article.title, activeTriviaCount]);

    return (
      <div className="mt-3 border-t pt-3 bg-gray-50 rounded-b-lg px-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => toggleTriviaSection(article.id)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm font-medium hover:bg-blue-100"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            一口メモ
            {totalTriviaCount > 0 && (
              <div className="flex gap-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {activeTriviaCount}件アクティブ
                </span>
                {totalTriviaCount > activeTriviaCount && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    +{totalTriviaCount - activeTriviaCount}件非アクティブ
                  </span>
                )}
              </div>
            )}
          </Button>

          {isExpanded && !isEditing && (
            <Button
              onClick={() => startCreatingTrivia(article.id)}
              disabled={triviaLoading[article.id]}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 hover:bg-green-50 hover:border-green-300"
            >
              <Plus className="h-3 w-3" />
              追加
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* 編集フォーム */}
            {isEditing && (
              <TriviaEditForm
                key={`trivia-edit-${article.id}-${editingTrivia[article.id]}`}
                articleId={article.id}
              />
            )}

            {/* 一口メモリスト */}
            {article.trivia && article.trivia.length > 0 ? (
              <div className="space-y-3">
                {/* アクティブな一口メモ */}
                {article.trivia
                  .filter((trivia) => trivia.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((trivia, index) => (
                    <TriviaDisplay
                      key={`active-${trivia.id}`}
                      articleId={article.id}
                      trivia={trivia}
                      index={index}
                    />
                  ))}

                {/* 非アクティブな一口メモ（折りたたみ可能） */}
                {article.trivia.filter((trivia) => !trivia.isActive).length >
                  0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
                      <span>
                        非アクティブな一口メモ (
                        {
                          article.trivia.filter((trivia) => !trivia.isActive)
                            .length
                        }
                        件)
                      </span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      {article.trivia
                        .filter((trivia) => !trivia.isActive)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((trivia, index) => (
                          <div
                            key={`inactive-${trivia.id}`}
                            className="opacity-60"
                          >
                            <TriviaDisplay
                              articleId={article.id}
                              trivia={trivia}
                              index={index}
                            />
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              !isEditing && (
                <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg bg-white">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-medium">まだ一口メモがありません</p>
                      <p className="text-xs text-gray-400 mt-1">
                        記事に関連する豆知識や補足情報を追加できます
                      </p>
                    </div>
                    <Button
                      onClick={() => startCreatingTrivia(article.id)}
                      variant="outline"
                      size="sm"
                      className="mt-2 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      最初の一口メモを追加
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* ローディング表示 */}
            {triviaLoading[article.id] && (
              <div className="text-center py-3 bg-blue-50 rounded-lg">
                <div className="inline-flex items-center gap-2">
                  <div className="inline-block animate-spin w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                  <span className="text-sm text-blue-700">処理中...</span>
                </div>
              </div>
            )}

            {/* 一口メモの統計情報 */}
            {totalTriviaCount > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span>
                    📊 合計 {totalTriviaCount}件 (アクティブ:{" "}
                    {activeTriviaCount}件, 非アクティブ:{" "}
                    {totalTriviaCount - activeTriviaCount}件)
                  </span>
                  {totalTriviaCount > 1 && (
                    <span className="text-blue-600">
                      順序は上下矢印で変更可能
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 🆕 一口メモ編集フォームコンポーネント（マークダウン対応）
  const TriviaEditForm = ({ articleId }: { articleId: string }) => {
    const data = editingTriviaData[articleId];
    const [showPreview, setShowPreview] = useState(false);

    if (!data) return null;

    // マークダウンプレビューコンポーネント
    const MarkdownPreview = ({ content }: { content: string }) => {
      if (!content.trim()) {
        return (
          <div className="bg-gray-100 p-4 rounded text-gray-500 text-sm">
            プレビュー内容がありません
          </div>
        );
      }

      return (
        <div className="bg-gray-900 text-gray-100 p-4 rounded border max-h-60 overflow-y-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ children, ...props }) => (
                <p className="text-gray-200 mb-2 last:mb-0" {...props}>
                  {children}
                </p>
              ),
              strong: ({ children, ...props }) => (
                <strong className="text-yellow-400 font-bold" {...props}>
                  {children}
                </strong>
              ),
              em: ({ children, ...props }) => (
                <em className="text-gray-300 italic" {...props}>
                  {children}
                </em>
              ),
              code: (props) => {
                const { children, className, ...restProps } =
                  props as React.ComponentProps<"code"> & {
                    className?: string;
                  };
                const match = /language-(\w+)/.exec(className || "");

                if (!match) {
                  // インラインコード
                  return (
                    <code
                      className="bg-gray-700 text-yellow-300 px-1 rounded text-sm"
                      {...restProps}
                    >
                      {children}
                    </code>
                  );
                }

                // コードブロック
                return (
                  <code
                    className="block bg-gray-700 text-yellow-300 p-2 rounded text-sm overflow-x-auto my-2"
                    {...restProps}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children, ...props }) => (
                <pre
                  className="bg-gray-700 border border-gray-600 rounded p-2 my-2 overflow-x-auto text-sm"
                  {...props}
                >
                  {children}
                </pre>
              ),
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  className="text-blue-400 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
              ul: ({ children, ...props }) => (
                <ul className="list-disc list-inside my-2" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="list-decimal list-inside my-2" {...props}>
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li className="text-gray-200 mb-1" {...props}>
                  {children}
                </li>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote
                  className="border-l-4 border-yellow-400 pl-3 my-2 italic text-gray-300"
                  {...props}
                >
                  {children}
                </blockquote>
              ),
              h1: ({ children, ...props }) => (
                <h1
                  className="text-lg font-bold text-yellow-400 mb-2 mt-3 first:mt-0"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-base font-semibold text-yellow-300 mb-2 mt-2 first:mt-0"
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-sm font-semibold text-gray-200 mb-1 mt-2 first:mt-0"
                  {...props}
                >
                  {children}
                </h3>
              ),
              hr: (props) => <hr className="border-gray-600 my-3" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    };

    return (
      <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          {/* 🔧 修正されたタイトル入力フィールド */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) =>
                updateTriviaData(articleId, "title", e.target.value)
              }
              placeholder="一口メモのタイトルを入力してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              例: 「蝉丸の由来」「能楽との関係」「歴史的背景」など
            </p>
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              カテゴリー
            </label>
            <select
              value={data.category}
              onChange={(e) =>
                updateTriviaData(articleId, "category", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">デフォルト</option>
              <option value="shrine">神社</option>
              <option value="anime">アニメ・文化</option>
              <option value="food">食べ物</option>
              <option value="culture">文化</option>
              <option value="history">歴史</option>
              <option value="nature">自然</option>
              <option value="festival">祭り</option>
              <option value="mythology">神話</option>
              <option value="customs">風習</option>
            </select>
          </div>

          {/* 🆕 カスタムアイコン入力フィールド */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              カスタムアイコン（URL）
            </label>
            <input
              type="url"
              value={data.iconEmoji || ""}
              onChange={(e) =>
                updateTriviaData(articleId, "iconEmoji", e.target.value)
              }
              placeholder="https://example.com/icon.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">
                アイコンのURLを入力してください（オプション）
              </p>
              {data.iconEmoji && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">プレビュー:</span>
                  <img
                    src={data.iconEmoji}
                    alt="icon preview"
                    className="w-6 h-6 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* コンテンツ（マークダウン対応） */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                コンテンツ（マークダウン記法対応）{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="hover:bg-blue-50"
                >
                  {showPreview ? "編集" : "プレビュー"}
                </Button>
              </div>
            </div>

            {showPreview ? (
              <MarkdownPreview content={data.content} />
            ) : (
              <textarea
                value={data.content}
                onChange={(e) =>
                  updateTriviaData(articleId, "content", e.target.value)
                }
                placeholder="一口メモの内容をマークダウン記法で入力してください。&#10;&#10;例：&#10;**蝉丸神社**は滋賀県大津市にある神社で、*音楽の神様*として知られています。&#10;&#10;- 能楽の祖とされる蝉丸を祀る&#10;- 音楽・芸能関係者の参拝が多い&#10;- 逢坂の関の近くに位置する"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={8}
                maxLength={2000}
              />
            )}

            <div className="mt-2 text-sm text-gray-600">
              <p className="mb-1">マークダウン記法が使用できます：</p>
              <div className="flex flex-wrap gap-4 mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  **太字**
                </code>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  *斜体*
                </code>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  `コード`
                </code>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  [リンク](URL)
                </code>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  - リスト
                </code>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  &gt; 引用
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                残り文字数: {2000 - data.content.length}文字
              </p>
            </div>
          </div>

          {/* アクティブ状態 */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id={`isActive-${articleId}`}
              checked={data.isActive}
              onChange={(e) =>
                updateTriviaData(articleId, "isActive", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`isActive-${articleId}`}
              className="text-sm font-medium text-gray-700"
            >
              アクティブ（この一口メモを表示する）
            </label>
            <div className="ml-auto text-xs text-gray-500">
              {data.isActive ? "✅ 公開中" : "⏸️ 非公開"}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
            <Button
              onClick={() => saveTrivia(articleId)}
              disabled={
                triviaLoading[articleId] ||
                !data.content.trim() ||
                !data.title.trim()
              }
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              <Save className="h-4 w-4" />
              {triviaLoading[articleId] ? "保存中..." : "保存"}
            </Button>
            <Button
              onClick={() => cancelEditingTrivia(articleId)}
              disabled={triviaLoading[articleId]}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-4 py-2"
            >
              <X className="h-4 w-4" />
              キャンセル
            </Button>

            {/* 入力状況の表示 */}
            <div className="ml-auto text-xs text-gray-500">
              {!data.title.trim() && !data.content.trim() ? (
                <span className="text-red-500">
                  ⚠️ タイトルとコンテンツが必要です
                </span>
              ) : !data.title.trim() ? (
                <span className="text-red-500">⚠️ タイトルが必要です</span>
              ) : !data.content.trim() ? (
                <span className="text-red-500">⚠️ コンテンツが必要です</span>
              ) : (
                <span className="text-green-600">✅ 保存可能</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔧 記事カードコンポーネントの修正版（一口メモ表示問題を解決）
  const ArticleCard = ({
    article,
    searchQuery,
    searchType,
    showContentMatches,
    contentSearchResults,
    toggleContentMatches,
  }: {
    article: Article;
    searchQuery: string;
    searchType: "title" | "content" | "both";
    showContentMatches: { [key: string]: boolean };
    contentSearchResults: { [key: string]: ContentMatch[] };
    toggleContentMatches: (articleId: string) => void;
  }) => {
    const featuredImage =
      article.images?.find((img) => img.isFeatured) ||
      article.images?.[0] ||
      null;
    const plainContent = getPlainTextFromHtml(article.content);
    const excerptContent =
      plainContent.length > 100
        ? `${plainContent.substring(0, 100)}...`
        : plainContent;

    const hasContentSearch =
      searchQuery && (searchType === "content" || searchType === "both");

    return (
      <div
        key={article.id}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex p-4">
          <div className="flex-shrink-0 w-32 h-32 relative mr-4">
            {featuredImage ? (
              <Image
                src={featuredImage.url}
                alt={featuredImage.altText || article.title}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                <p className="text-gray-500 text-sm">画像なし</p>
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-1 text-gray-900">
              {article.title}
            </h3>
            <div className="text-sm text-gray-600 mb-2">
              {formatDate(article.createdAt)}
            </div>

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

            <div className="flex items-center gap-2 mb-3">
              <Link href={getEditLink(article.slug)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm py-1 hover:bg-blue-50"
                >
                  記事を編集
                </Button>
              </Link>

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

              {/* デバッグ情報 */}
              {/* {debugMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-xs py-1 text-yellow-600"
                >
                  🐛 Debug
                </Button>
              )} */}
            </div>

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

            {/* 🆕 改善された一口メモセクション */}
            <TriviaSection
              article={article}
              expandedTrivia={expandedTrivia}
              editingTrivia={editingTrivia}
              triviaLoading={triviaLoading}
              toggleTriviaSection={toggleTriviaSection}
              startCreatingTrivia={startCreatingTrivia}
            />

            {/* デバッグ情報 */}
            {/* <DebugInfo article={article} /> */}
          </div>
        </div>
      </div>
    );
  };
  // メインレンダリング
  return (
    <div className="space-y-6">
      {/* デバッグコントロール */}
      {/* {debugMode && <DebugControls />} */}

      {/* 置換結果モーダル */}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
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
          {/* {process.env.NODE_ENV === "development" && (
            <Button
              variant="outline"
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              🐛 Debug
            </Button>
          )} */}
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
      {/* 検索セクション */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <div className="space-y-3">
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

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* メインコンテンツ */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* アクティブフィルター表示 */}
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

          {/* 記事グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles && articles.length > 0 ? (
              articles.map((article: Article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  searchQuery={searchQuery}
                  searchType={searchType}
                  showContentMatches={showContentMatches}
                  contentSearchResults={contentSearchResults}
                  toggleContentMatches={toggleContentMatches}
                />
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
