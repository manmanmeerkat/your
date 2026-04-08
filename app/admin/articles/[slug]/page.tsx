// 記事編集ページ - パート1（前半）
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { ExternalLink, Copy, Eye, Check } from "lucide-react";

export default function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [catchCopy, setCatchCopy] = useState("");

  // 画像状態の分離
  const [editorImage, setEditorImage] = useState<{
    id: string;
    url: string;
    altText?: string;
  } | null>(null); // 記事編集専用の画像
  const [initialFeaturedImage, setInitialFeaturedImage] = useState<{
    id: string;
    url: string;
    altText?: string;
  } | null>(null); // 初期読み込み時のフィーチャー画像を保持

  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoUpdateSummary, setAutoUpdateSummary] = useState(false);

  // 記事IDの状態を追加
  const [articleId, setArticleId] = useState<string>("");

  // URL関連の状態
  const [urlCopied, setUrlCopied] = useState(false);

  const isMountedRef = useRef(true);
  const searchParams = useSearchParams();

  // 戻り先ページの状態を取得
  const returnPath = searchParams.get("returnPath") || "/admin";
  const returnCategory = searchParams.get("category") || "";
  const returnSearch = searchParams.get("search") || "";
  const returnPage = searchParams.get("page") || "1";

  // 本番環境のURL構築
  const productionBaseUrl = "https://www.yoursecretjapan.com";
  const productionUrl = `${productionBaseUrl}/articles/${encodeURIComponent(
    slug || params.slug
  )}`;

  // URLをクリップボードにコピーする関数
  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productionUrl);
      setUrlCopied(true);
      setTimeout(() => {
        setUrlCopied(false);
      }, 2000);
    } catch (error) {
      console.error("URL copy failed:", error);
      const textArea = document.createElement("textarea");
      textArea.value = productionUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  // 本番サイトで記事をプレビューする関数
  const previewInProduction = () => {
    window.open(productionUrl, "_blank", "noopener,noreferrer");
  };

  // マークダウン記法を削除する関数
  const stripMarkdown = (text: string) => {
    if (!text) return "";

    let result = text.replace(/^#+\s+/gm, "");
    result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");
    result = result.replace(/(\*|_)(.*?)\1/g, "$2");
    result = result.replace(/```[\s\S]*?```/g, "");
    result = result.replace(/`([^`]+)`/g, "$1");
    result = result.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    result = result.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "");
    result = result.replace(/^[\-\*\+]\s+/gm, "");
    result = result.replace(/^\d+\.\s+/gm, "");
    result = result.replace(/^([\-\*\_]){3,}$/gm, "");
    result = result.replace(/^\>\s+/gm, "");
    result = result.replace(/\|.*\|/g, "");
    result = result.replace(/\n\s*\n/g, "\n");

    let truncated = result.trim().substring(0, 150);
    const lastPeriod = truncated.lastIndexOf("。");
    if (lastPeriod > 0 && lastPeriod < 140) {
      truncated = truncated.substring(0, lastPeriod + 1);
    }

    return truncated;
  };

  // コンテンツの変更ハンドラー
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (autoUpdateSummary) {
      setSummary(stripMarkdown(newContent));
    }
  };

  // マウント状態の管理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ローカルストレージ関数
  const getLocalArticleData = () => {
    try {
      const savedData = localStorage.getItem(`article_draft_${params.slug}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error("ローカルストレージからのデータ取得に失敗:", e);
    }
    return null;
  };

  const saveLocalArticleData = (data: Record<string, unknown>) => {
    try {
      localStorage.setItem(
        `article_draft_${params.slug}`,
        JSON.stringify(data)
      );
    } catch (e) {
      console.error("ローカルストレージへのデータ保存に失敗:", e);
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!isMountedRef.current) return;

      try {
        console.log("Fetching article with slug:", params.slug);

        if (!params.slug) {
          throw new Error("スラッグが指定されていません");
        }

        await supabase.auth.getSession();

        // ローカルデータの確認
        const localData = getLocalArticleData();
        if (
          localData &&
          localData.timestamp &&
          Date.now() - localData.timestamp < 3600000
        ) {
          console.log("Using local cached data");
          setTitle(localData.title);
          setSlug(localData.slug);
          setSummary(localData.summary || "");
          setDescription(localData.description || "");
          setCatchCopy(localData.catchCopy || "");
          setContent(localData.content);
          setCategory(localData.category);
          setPublished(localData.published);
          setArticleId(localData.articleId || "");

          if (localData.editorImage) {
            setEditorImage(localData.editorImage);
            setAltText(localData.editorImage.altText || "");
          }
          if (localData.initialFeaturedImage) {
            setInitialFeaturedImage(localData.initialFeaturedImage);
          }

          setLoading(false);
          return;
        }

        // スラッグをエンコード
        const encodedSlug = encodeURIComponent(params.slug);

        const response = await fetch(`/api/articles/${encodedSlug}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "記事の取得に失敗しました");
        }

        if (!isMountedRef.current) return;

        const article = await response.json();
        console.log("Article data received:", article);

        setTitle(article.title);
        setSlug(article.slug);
        setSummary(article.summary || "");
        setAutoUpdateSummary(false);
        setDescription(article.description || "");
        setContent(article.content);
        setCategory(article.category);
        setPublished(article.published);
        setArticleId(article.id);
        setCatchCopy(article.catchCopy || "");

        // 画像の処理を修正 - 記事編集用のフィーチャー画像のみを取得
        const managedImages =
          article.images?.filter(
            (img: { url: string }) => img.url.includes("/images/articles/") // 画像管理システムの画像は除外
          ) || [];

        const editorFeaturedImage =
          article.images?.find(
            (img: { isFeatured: boolean; url: string }) =>
              img.isFeatured && !img.url.includes("/images/articles/")
          ) || null;

        console.log("画像処理結果:", {
          totalImages: article.images?.length || 0,
          managedImages: managedImages.length,
          editorFeaturedImage: !!editorFeaturedImage,
        });

        // 記事編集用の画像を設定（画像管理システムの画像は無視）
        setEditorImage(editorFeaturedImage);
        setInitialFeaturedImage(editorFeaturedImage);

        if (editorFeaturedImage) {
          setAltText(editorFeaturedImage.altText || "");
        }

        // ローカルストレージにキャッシュ（分離された画像情報で保存）
        saveLocalArticleData({
          title: article.title,
          slug: article.slug,
          summary: article.summary || "",
          description: article.description || "",
          catchCopy: article.catchCopy || "",
          content: article.content,
          category: article.category,
          published: article.published,
          articleId: article.id,
          editorImage: editorFeaturedImage,
          initialFeaturedImage: editorFeaturedImage,
          timestamp: Date.now(),
        });
      } catch (error: unknown) {
        console.error("記事取得エラー:", error);

        if (!isMountedRef.current) return;

        const localData = getLocalArticleData();
        if (localData) {
          console.log("Using local cached data as fallback after fetch error");
          setTitle(localData.title);
          setSlug(localData.slug);
          setSummary(localData.summary || "");
          setDescription(localData.description || "");
          setContent(localData.content);
          setCategory(localData.category);
          setPublished(localData.published);
          setArticleId(localData.articleId || "");
          setCatchCopy(localData.catchCopy || "");

          if (localData.editorImage) {
            setEditorImage(localData.editorImage);
            setAltText(localData.editorImage.altText || "");
          }
          if (localData.initialFeaturedImage) {
            setInitialFeaturedImage(localData.initialFeaturedImage);
          }

          setError(
            "APIからのデータ取得に失敗しましたが、ローカルデータを復元しました。保存前にデータを確認してください。"
          );
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "予期せぬエラーが発生しました"
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      isMountedRef.current = false;
    };
  }, [params.slug]);
  // 以下はパート1の続きです

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 画像アップロード関数
  const uploadImage = async () => {
    if (!file || !articleId) return null;

    setUploading(true);
    console.log("記事編集用画像アップロード:", file.name);

    try {
      // 従来のアップロード方式を使用（記事編集専用）
      console.log("Using legacy upload method for article editor");

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

      const newFile = new File([file], safeFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      const formData = new FormData();
      formData.append("file", newFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!isMountedRef.current) return null;

      console.log("Article editor upload response status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "画像のアップロードに失敗しました"
        );
      }

      console.log("記事編集用画像アップロード成功:", data.url);

      return {
        url: data.url,
        altText: altText || file.name.replace(/\.[^/.]+$/, ""),
        isFeatured: true,
      };
    } catch (error: unknown) {
      console.error("記事編集用画像アップロードエラー:", error);
      if (isMountedRef.current) {
        setError(
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました"
        );
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  const handleDeleteImage = () => {
    if (!editorImage) return;

    try {
      setEditorImage(null);
      setAltText("");
      setPreview(null);
    } catch (error: unknown) {
      console.error("Image delete error:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // ナビゲーション関数
  const navigateToAdminDashboard = () => {
    try {
      sessionStorage.removeItem("dashboardInitialized");

      if (saveSuccess) {
        localStorage.removeItem(`article_draft_${params.slug}`);
      }

      let url = "/admin";
      url += `?_ts=${Date.now()}`;

      console.log("管理者トップページへ遷移:", url);
      window.location.href = url;
    } catch (error) {
      console.error("ナビゲーションエラー:", error);
      setError("ページ遷移に失敗しました。再度お試しください。");
      setSaving(false);
    }
  };

  const navigateBack = () => {
    try {
      sessionStorage.removeItem("dashboardInitialized");

      let url = returnPath;
      const urlParams = new URLSearchParams();

      if (returnCategory) urlParams.append("category", returnCategory);
      if (returnSearch) urlParams.append("search", returnSearch);

      if (returnPage && returnPage !== "") {
        urlParams.append("page", returnPage);
      }

      const queryString = urlParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      console.log("戻り先URL:", url);

      if (url.includes("?")) {
        url += `&_ts=${Date.now()}`;
      } else {
        url += `?_ts=${Date.now()}`;
      }

      window.location.href = url;
    } catch (error) {
      console.error("ナビゲーションエラー:", error);
      setError("ページ遷移に失敗しました。再度お試しください。");
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setSaveSuccess(false);
    setError("");

    try {
      if (!title || !slug || !content || !category) {
        throw new Error("タイトル、スラッグ、コンテンツ、カテゴリーは必須です");
      }

      // 新しい画像のアップロード処理（記事編集専用）
      let uploadedImageData = null;
      if (file) {
        console.log("記事編集用画像アップロード開始...");
        uploadedImageData = await uploadImage();

        if (!uploadedImageData) {
          throw new Error("画像のアップロードに失敗しました");
        }
      }

      if (!isMountedRef.current) return;

      // 記事データの準備
      const updateData: {
        title: string;
        slug: string;
        summary: string;
        description: string;
        catchCopy:string;
        content: string;
        category: string;
        published: boolean;
        updateImages: boolean;
        images?: Array<{
          id?: string;
          url: string;
          altText: string;
          isFeatured: boolean;
        }>;
      } = {
        title,
        slug,
        summary,
        description,
        catchCopy,
        content,
        category,
        published,
        updateImages: false, // デフォルトは false（画像管理システムの画像を保持）
      };

      // 記事編集用画像の更新処理（画像管理システムの画像は保持）
      if (uploadedImageData) {
        // 新しい画像がアップロードされた場合のみ更新
        updateData.updateImages = true;
        updateData.images = [uploadedImageData];
        console.log("新しい記事編集用画像をフィーチャー画像として設定");
      } else if (editorImage && editorImage.id) {
        // 既存の記事編集用画像の代替テキストのみ更新
        if (altText !== (editorImage.altText || "")) {
          updateData.updateImages = true;
          updateData.images = [
            {
              id: editorImage.id,
              url: editorImage.url,
              altText: altText,
              isFeatured: true,
            },
          ];
          console.log("既存記事編集用画像の代替テキストを更新");
        } else {
          console.log("記事編集用画像に変更なし");
        }
      } else if (editorImage === null && initialFeaturedImage) {
        // 記事編集用画像が削除された場合
        updateData.updateImages = true;
        updateData.images = [];
        console.log(
          "記事編集用フィーチャー画像を削除（画像管理システムの画像は保持）"
        );
      } else {
        console.log("画像更新をスキップ（画像管理システムの画像を完全保護）");
      }

      console.log("Updating article with data:", updateData);

      // 記事を更新
      const encodedSlug = encodeURIComponent(params.slug);
      console.log("Encoded slug for API call:", encodedSlug);

      const response = await fetch(`/api/articles/${encodedSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        let errorMessage = "記事の更新に失敗しました";
        try {
          const data = await response.json();
          errorMessage = data.error || data.details || errorMessage;
          console.error("APIエラーデータ:", data);
        } catch (e) {
          console.error("APIエラーのパースに失敗:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Update successful:", data);

      localStorage.removeItem(`article_draft_${params.slug}`);
      setSaveSuccess(true);

      setTimeout(() => {
        if (isMountedRef.current) {
          navigateToAdminDashboard();
        }
      }, 500);
    } catch (error: unknown) {
      console.error("Article save error:", error);

      if (!isMountedRef.current) return;

      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      );
      setSaving(false);
    }
  };

  // 記事の削除処理
  const handleDelete = async () => {
    if (!confirm("本当にこの記事を削除しますか？この操作は元に戻せません。")) {
      return;
    }

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const encodedSlug = encodeURIComponent(params.slug);

      const response = await fetch(`/api/articles/${encodedSlug}`, {
        method: "DELETE",
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || data.details || "記事の削除に失敗しました"
        );
      }

      setSaveSuccess(true);
      localStorage.removeItem(`article_draft_${params.slug}`);

      setTimeout(() => {
        if (isMountedRef.current) {
          navigateToAdminDashboard();
        }
      }, 500);
    } catch (error: unknown) {
      console.error("Article delete error:", error);

      if (!isMountedRef.current) return;

      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 本番URL表示カード */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            本番環境URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
              <code className="flex-1 text-sm break-all text-blue-600">
                {productionUrl}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyUrlToClipboard}
                className="flex-shrink-0"
                disabled={saving}
              >
                {urlCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    コピー完了
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    コピー
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={previewInProduction}
                disabled={saving || !published}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                本番サイトで確認
              </Button>
              {!published && (
                <span className="text-sm text-amber-600 flex items-center">
                  ※ 公開されていない記事です
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインの記事編集カード */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>記事編集</CardTitle>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? "処理中..." : "削除"}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p>{error}</p>
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                <p>保存が完了しました。ページ遷移中...</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                タイトル*
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事のタイトル"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                スラッグ*
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                required
                disabled={saving}
              />
              <p className="text-xs text-gray-500">
                URL: {productionBaseUrl}/articles/
                <strong>{slug || params.slug}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                説明文
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="記事の説明文..."
                className="h-20"
                disabled={saving}
              />
              <p className="text-xs text-gray-500">
                検索結果やSNSでの表示に使用されます。マークダウン記法なし、150文字以内推奨。
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="catchCopy" className="text-sm font-medium">
                キャッチコピー
              </label>
              <Textarea
                id="catchCopy"
                value={catchCopy}
                onChange={(e) => setCatchCopy(e.target.value)}
                placeholder="記事冒頭に表示する短いキャッチコピー..."
                className="h-20"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="summary" className="text-sm font-medium">
                  要約
                </label>
                <div className="flex items-center">
                  <input
                    id="autoUpdateSummary"
                    type="checkbox"
                    checked={autoUpdateSummary}
                    onChange={(e) => setAutoUpdateSummary(e.target.checked)}
                    className="rounded border-gray-300 mr-1"
                    disabled={saving}
                  />
                  <label
                    htmlFor="autoUpdateSummary"
                    className="text-xs text-gray-500"
                  >
                    本文から自動生成
                  </label>
                </div>
              </div>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="記事の要約..."
                className="h-20"
                disabled={saving || autoUpdateSummary}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                本文* (マークダウン記法対応)
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="記事の本文..."
                className="h-40 font-mono"
                required
                disabled={saving}
              />
              <p className="text-xs text-gray-500">
                マークダウン記法を使って記事本文を書くことができます。
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                カテゴリー*
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
                disabled={saving}
              >
                <option value="culture">文化</option>
                <option value="mythology">神話</option>
                <option value="tradition">伝統</option>
                <option value="festivals">祭り</option>
                <option value="places">場所</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">記事編集用画像</label>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
                ℹ️
                この画像は記事編集専用です。画像管理システムの画像とは独立しています。
              </div>

              {/* 現在の記事編集用画像表示 */}
              {editorImage && !preview && (
                <div className="mt-2 relative">
                  <div className="relative h-auto w-full max-w-xs bg-slate-200 rounded-md overflow-hidden">
                    <div className="w-full pb-[56.25%] relative">
                      <Image
                        src={editorImage.url}
                        alt={editorImage.altText || "記事画像"}
                        fill
                        style={{ objectFit: "contain" }}
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50"
                    onClick={handleDeleteImage}
                    disabled={saving}
                  >
                    削除
                  </Button>
                </div>
              )}

              {/* 新しい画像プレビュー */}
              {preview && (
                <div className="mt-2 relative">
                  <div className="relative h-auto w-full max-w-xs bg-slate-200 rounded-md overflow-hidden">
                    <div className="w-full pb-[56.25%] relative">
                      <Image
                        src={preview}
                        alt="画像プレビュー"
                        fill
                        style={{ objectFit: "contain" }}
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    disabled={saving}
                  >
                    キャンセル
                  </Button>
                </div>
              )}

              {/* 画像アップロード */}
              {!preview && (
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2"
                  disabled={saving}
                />
              )}
            </div>

            {/* 画像の代替テキスト入力欄 */}
            {(editorImage || preview) && (
              <div className="space-y-2">
                <label htmlFor="altText" className="text-sm font-medium">
                  画像の代替テキスト
                </label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="画像の説明"
                  disabled={saving}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-gray-300"
                disabled={saving}
              />
              <label htmlFor="published" className="text-sm font-medium">
                公開する
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={navigateBack}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={saving || uploading}
                className={saving ? "bg-gray-500" : ""}
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    保存中...
                  </div>
                ) : (
                  "保存"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 画像管理システムとの違いを説明するカード */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center gap-2">
            📋 画像管理について
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">
                📝 記事編集用画像:
              </span>
              <span>
                この記事に直接添付される画像。記事一覧などでサムネイルとして表示されます。
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-green-600">
                🗂️ 画像管理システム:
              </span>
              <span>
                記事内で使用する複数の画像を管理。マークダウンで記事本文に挿入できます。
              </span>
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
              💡 <strong>重要:</strong>{" "}
              この2つの画像システムは完全に独立しており、互いに影響しません。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
