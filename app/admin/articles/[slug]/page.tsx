// 修正版 EditArticlePage - 画像管理システム連携対応

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
  const [image, setImage] = useState<{
    id: string;
    url: string;
    altText?: string;
  } | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoUpdateSummary, setAutoUpdateSummary] = useState(true);

  // 🆕 記事IDの状態を追加
  const [articleId, setArticleId] = useState<string>("");

  // 新しく追加: URL関連の状態
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

      // 2秒後にコピー状態をリセット
      setTimeout(() => {
        setUrlCopied(false);
      }, 2000);
    } catch (error) {
      console.error("URL copy failed:", error);
      // フォールバック: 選択可能な状態にする
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

    // 見出し記号(#)の削除
    let result = text.replace(/^#+\s+/gm, "");

    // 強調(**と__)の削除
    result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");

    // 斜体(*と_)の削除
    result = result.replace(/(\*|_)(.*?)\1/g, "$2");

    // コードブロック(```)と行内コード(`)の削除
    result = result.replace(/```[\s\S]*?```/g, "");
    result = result.replace(/`([^`]+)`/g, "$1");

    // リンク記法([text](url))の削除 - テキスト部分のみを残す
    result = result.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // 画像記法(![alt](src))の削除
    result = result.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "");

    // リスト記号(-, *, +)の削除
    result = result.replace(/^[\-\*\+]\s+/gm, "");

    // 番号付きリストの削除
    result = result.replace(/^\d+\.\s+/gm, "");

    // 水平線(---, ***, ___)の削除
    result = result.replace(/^([\-\*\_]){3,}$/gm, "");

    // 引用(>)の削除
    result = result.replace(/^\>\s+/gm, "");

    // 表記法の削除
    result = result.replace(/\|.*\|/g, "");

    // 余分な空白行の削除
    result = result.replace(/\n\s*\n/g, "\n");

    // 最初の数文字（最大150文字程度）を抽出
    let truncated = result.trim().substring(0, 150);

    // 文章が途中で切れないように調整（最後のピリオドまで）
    const lastPeriod = truncated.lastIndexOf("。");
    if (lastPeriod > 0 && lastPeriod < 140) {
      truncated = truncated.substring(0, lastPeriod + 1);
    }

    return truncated;
  };

  // コンテンツの変更ハンドラー - マークダウンから自動要約を生成
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // 自動要約機能がオンの場合、マークダウンを削除して要約欄を更新
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

  // ローカルストレージからデータを取得する関数
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

  // ローカルストレージにデータを保存する関数
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
          setContent(localData.content);
          setCategory(localData.category);
          setPublished(localData.published);
          setArticleId(localData.articleId || ""); // 🆕 記事IDを設定

          if (localData.image) {
            setImage(localData.image);
            setAltText(localData.image.altText || "");
          }

          setLoading(false);
          return;
        }

        // スラッグをエンコード
        const encodedSlug = encodeURIComponent(params.slug);

        // 通常のfetchを使用
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
        setDescription(article.description || "");
        setContent(article.content);
        setCategory(article.category);
        setPublished(article.published);
        setArticleId(article.id); // 🆕 記事IDを設定

        // 画像は最初の1枚だけを使用
        const featuredImage =
          article.images && article.images.length > 0
            ? article.images[0]
            : null;
        setImage(featuredImage);
        if (featuredImage) {
          setAltText(featuredImage.altText || "");
        }

        // ローカルストレージにキャッシュ
        saveLocalArticleData({
          title: article.title,
          slug: article.slug,
          summary: article.summary || "",
          description: article.description || "",
          content: article.content,
          category: article.category,
          published: article.published,
          articleId: article.id, // 🆕 記事IDも保存
          image: featuredImage,
          timestamp: Date.now(),
        });
      } catch (error: unknown) {
        console.error("記事取得エラー:", error);

        if (!isMountedRef.current) return;

        // ローカルデータがあれば最終手段としてそれを使用
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
          setArticleId(localData.articleId || ""); // 🆕 記事IDを設定

          if (localData.image) {
            setImage(localData.image);
            setAltText(localData.image.altText || "");
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

    // クリーンアップ
    return () => {
      isMountedRef.current = false;
    };
  }, [params.slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // 画像プレビューの作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 🔧 画像アップロード関数を画像管理システム対応に修正
  const uploadImage = async () => {
    if (!file || !articleId) return null;

    setUploading(true);
    console.log("Uploading image to image management system:", file.name);

    try {
      // 🆕 画像管理システムのAPIを使用
      const formData = new FormData();
      formData.append("image", file);
      formData.append("altText", altText || file.name.replace(/\.[^/.]+$/, ""));

      const response = await fetch(`/api/articles/${articleId}/images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!isMountedRef.current) return null;

      console.log("Image management upload response status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "画像のアップロードに失敗しました"
        );
      }

      console.log("Image uploaded successfully to management system:", data);

      // 🆕 画像管理システムから返された画像情報を返す
      return {
        id: data.image.id,
        url: data.image.url,
        altText: data.image.altText,
        isFeatured: data.image.isFeatured,
      };
    } catch (error: unknown) {
      console.error("Image management upload error:", error);

      // 🔧 フォールバック: 従来のアップロード方式
      console.log("Falling back to legacy upload method");

      try {
        // ファイル名を安全な形式に変換
        const safeFileName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_+/g, "_")
          .toLowerCase();

        // 新しいファイル名でファイルを作成
        const newFile = new File([file], safeFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });

        // フォームデータの作成
        const formData = new FormData();
        formData.append("file", newFile);

        // 通常のfetchを使用
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!isMountedRef.current) return null;

        console.log("Legacy upload response status:", response.status);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.details || "画像のアップロードに失敗しました"
          );
        }

        console.log("Image uploaded successfully via legacy method:", data.url);

        // 🆕 従来形式の場合は新しいIDを生成
        return {
          url: data.url,
          altText: altText || file.name.replace(/\.[^/.]+$/, ""),
          isFeatured: true,
        };
      } catch (legacyError: unknown) {
        console.error("Legacy upload also failed:", legacyError);
        if (isMountedRef.current) {
          setError(
            legacyError instanceof Error
              ? legacyError.message
              : "画像のアップロードに失敗しました"
          );
        }
        return null;
      }
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  const handleDeleteImage = () => {
    if (!image) return;

    try {
      // 画像情報をクリア
      setImage(null);
      setAltText("");
      setPreview(null);
    } catch (error: unknown) {
      console.error("Image delete error:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // 管理者トップページに戻る関数
  const navigateToAdminDashboard = () => {
    try {
      // セッションストレージのリセット（ダッシュボード再初期化のため）
      sessionStorage.removeItem("dashboardInitialized");

      // 保存成功時はローカルストレージのドラフトをクリア
      if (saveSuccess) {
        localStorage.removeItem(`article_draft_${params.slug}`);
      }

      // 管理者トップページへのURL構築
      let url = "/admin";

      // 強制的にキャッシュ回避のためにタイムスタンプを追加
      url += `?_ts=${Date.now()}`;

      console.log("管理者トップページへ遷移:", url);

      // 直接ブラウザの遷移を使用
      window.location.href = url;
    } catch (error) {
      console.error("ナビゲーションエラー:", error);
      setError("ページ遷移に失敗しました。再度お試しください。");
      setSaving(false);
    }
  };

  // 元のページに戻る関数（キャンセル時に使用）
  const navigateBack = () => {
    try {
      // セッションストレージのリセット（ダッシュボード再初期化のため）
      sessionStorage.removeItem("dashboardInitialized");

      // 戻り先のURLを構築
      let url = returnPath;

      // クエリパラメータを追加
      const urlParams = new URLSearchParams();

      // 特に注意：returnPageの処理を強化
      if (returnCategory) urlParams.append("category", returnCategory);
      if (returnSearch) urlParams.append("search", returnSearch);

      // returnPageが存在し、空でなければ追加
      if (returnPage && returnPage !== "") {
        urlParams.append("page", returnPage);
      }

      // パラメータがある場合は追加
      const queryString = urlParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      console.log("戻り先URL:", url);

      // 強制的にキャッシュ回避のためにタイムスタンプを追加
      if (url.includes("?")) {
        url += `&_ts=${Date.now()}`;
      } else {
        url += `?_ts=${Date.now()}`;
      }

      // 直接ブラウザの遷移を使用
      window.location.href = url;
    } catch (error) {
      console.error("ナビゲーションエラー:", error);
      setError("ページ遷移に失敗しました。再度お試しください。");
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // すでに保存中なら処理しない
    if (saving) return;

    setSaving(true);
    setSaveSuccess(false);
    setError("");

    try {
      // 必須フィールドの検証
      if (!title || !slug || !content || !category) {
        throw new Error("タイトル、スラッグ、コンテンツ、カテゴリーは必須です");
      }

      // 🔧 新しい画像のアップロード処理（画像管理システム連携）
      let uploadedImageData = null;
      if (file) {
        console.log("Starting image upload process...");
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
        content,
        category,
        published,
        updateImages: false, // 🔧 画像管理システムの画像を保持するため false に変更
      };

      // 🔧 画像の更新処理（画像管理システムの画像を保持）
      if (uploadedImageData) {
        // 新しい画像がある場合のみ、フィーチャー画像として設定
        updateData.updateImages = true;
        updateData.images = [
          {
            id: uploadedImageData.id,
            url: uploadedImageData.url,
            altText: uploadedImageData.altText,
            isFeatured: true,
          },
        ];
        console.log("🆕 新しい画像をフィーチャー画像として設定");
      } else if (image && image.id) {
        // 既存のフィーチャー画像の代替テキストのみ更新
        if (altText !== (image.altText || "")) {
          updateData.updateImages = true;
          updateData.images = [
            {
              id: image.id,
              url: image.url,
              altText: altText,
              isFeatured: true,
            },
          ];
          console.log("🔧 既存フィーチャー画像の代替テキストを更新");
        } else {
          console.log("📷 既存の画像設定を維持（変更なし）");
        }
      } else {
        // フィーチャー画像を削除する場合（画像管理システムの他の画像は保持）
        console.log(
          "🗑️ フィーチャー画像のみ削除（画像管理システムの画像は保持）"
        );
        // updateImages を false のままにして、既存の画像管理システムの画像を保持
      }

      console.log("Updating article with data:", updateData);

      // 記事を更新 - スラッグをエンコードして使用
      const encodedSlug = encodeURIComponent(params.slug);
      console.log("Encoded slug for API call:", encodedSlug);

      // 通常のフェッチを使用
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

      // ★ 追加: 保存成功後にローカルストレージをクリア
      localStorage.removeItem(`article_draft_${params.slug}`);

      // 保存成功フラグをセット
      setSaveSuccess(true);

      // 少し待機してから遷移
      setTimeout(() => {
        if (isMountedRef.current) {
          // 成功したら管理者トップページに戻る
          navigateToAdminDashboard();
        }
      }, 500);
    } catch (error: unknown) {
      console.error("Article save error:", error);

      if (!isMountedRef.current) return;

      // エラーメッセージをより詳細に表示
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

    // 既に処理中なら重複実行しない
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      // スラッグをエンコード
      const encodedSlug = encodeURIComponent(params.slug);

      // 通常のフェッチを使用
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

      // ローカルストレージのドラフトをクリア
      localStorage.removeItem(`article_draft_${params.slug}`);

      // 少し待機してから遷移
      setTimeout(() => {
        if (isMountedRef.current) {
          // 削除成功後も管理者トップページに戻る
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

  // ローディング中の表示を固定
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
            {/* URL表示 */}
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

            {/* アクションボタン */}
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

            {/* 説明文フィールド - SEO・SNS用 */}
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

            {/* 要約フィールド - 自動生成オプション付き */}
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
              <label className="text-sm font-medium">画像</label>

              {/* 現在の画像表示 */}
              {image && !preview && (
                <div className="mt-2 relative">
                  <div className="relative h-auto w-full max-w-xs bg-slate-200 rounded-md overflow-hidden">
                    <div className="w-full pb-[56.25%] relative">
                      <Image
                        src={image.url}
                        alt={image.altText || "記事画像"}
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
            {(image || preview) && (
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
    </div>
  );
}
