"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

type PageProps = {
  params: {
    slug: string;
  };
};

export default function EditArticlePage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("returnPath") || "/admin";
  const returnCategory = searchParams.get("category") || "";
  const returnSearch = searchParams.get("search") || "";
  const returnPage = searchParams.get("page") || "1";

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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
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

  // 進行中のリクエストを追跡するref
  const activeRequestRef = useRef<AbortController | null>(null);

  // コンポーネントのアンマウント時にリクエストを中止
  useEffect(() => {
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  // タイムアウト付きのフェッチ関数
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 30000
  ) => {
    // 前のリクエストがあればキャンセル
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // 新しいコントローラーを作成
    const controller = new AbortController();
    activeRequestRef.current = controller;

    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    } finally {
      // リクエストが完了したらrefをクリア
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
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
          // 1時間以内のデータがあればそれを使用
          console.log("Using local cached data");
          setTitle(localData.title);
          setSlug(localData.slug);
          setSummary(localData.summary || "");
          setContent(localData.content);
          setCategory(localData.category);
          setPublished(localData.published);

          if (localData.image) {
            setImage(localData.image);
            setAltText(localData.image.altText || "");
          }

          setLoading(false);
          return;
        }

        // スラッグをエンコード
        const encodedSlug = encodeURIComponent(params.slug);

        // タイムアウト付きのフェッチを使用
        const response = await fetchWithTimeout(
          `/api/articles/${encodedSlug}`,
          {},
          30000
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "記事の取得に失敗しました");
        }

        const article = await response.json();
        console.log("Article data received:", article);

        setTitle(article.title);
        setSlug(article.slug);
        setSummary(article.summary || "");
        setContent(article.content);
        setCategory(article.category);
        setPublished(article.published);

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
          content: article.content,
          category: article.category,
          published: article.published,
          image: featuredImage,
          timestamp: Date.now(),
        });
      } catch (error: unknown) {
        console.error("記事取得エラー:", error);

        // ローカルデータがあれば最終手段としてそれを使用
        const localData = getLocalArticleData();
        if (localData) {
          console.log("Using local cached data as fallback after fetch error");
          setTitle(localData.title);
          setSlug(localData.slug);
          setSummary(localData.summary || "");
          setContent(localData.content);
          setCategory(localData.category);
          setPublished(localData.published);

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
        setLoading(false);
      }
    };

    fetchArticle();
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

  const uploadImage = async () => {
    if (!file) return null;

    setUploading(true);
    console.log("Uploading image:", file.name);

    try {
      // ファイル名を安全な形式に変換
      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_") // 特殊文字をアンダースコアに置換
        .replace(/_+/g, "_") // 連続するアンダースコアを1つに
        .toLowerCase(); // 小文字に変換

      // 新しいファイル名でファイルを作成
      const newFile = new File([file], safeFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      // フォームデータの作成
      const formData = new FormData();
      formData.append("file", newFile);

      // アップロードリクエスト送信（タイムアウト付き）
      const response = await fetchWithTimeout(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        },
        60000
      ); // 画像アップロードは長めのタイムアウトを設定

      console.log("Upload response status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "画像のアップロードに失敗しました"
        );
      }

      console.log("Image uploaded successfully:", data.url);
      return data.url;
    } catch (error: unknown) {
      console.error("Image upload error:", error);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError(
            "画像アップロードがタイムアウトしました。ネットワーク接続を確認してください。"
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("画像のアップロードに失敗しました");
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
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

  // フィルタリング状態を保持して元のページに戻る関数
  const navigateBack = () => {
    try {
      // セッションストレージのリセット（ダッシュボード再初期化のため）
      sessionStorage.removeItem("dashboardInitialized");

      // 保存成功時はローカルストレージのドラフトをクリア
      if (saveSuccess) {
        localStorage.removeItem(`article_draft_${slug}`);
      }

      // 戻り先のURLを構築
      let url = returnPath;

      // クエリパラメータを追加
      const params = new URLSearchParams();

      // 特に注意：returnPageの処理を強化
      if (returnCategory) params.append("category", returnCategory);
      if (returnSearch) params.append("search", returnSearch);

      // returnPageが存在し、空でなければ追加
      if (returnPage && returnPage !== "") {
        params.append("page", returnPage);
      }

      // パラメータがある場合は追加
      const queryString = params.toString();
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

      // 新しい画像のアップロード（存在する場合）
      let uploadedImageUrl = null;
      if (file) {
        console.log("Starting image upload process...");
        uploadedImageUrl = await uploadImage();

        if (!uploadedImageUrl) {
          throw new Error("画像のアップロードに失敗しました");
        }
      }

      // 記事データの準備
      const updateData: {
        title: string;
        slug: string;
        summary: string;
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
        content,
        category,
        published,
        updateImages: true, // 画像の更新フラグを追加
      };

      // 画像の更新処理
      if (uploadedImageUrl) {
        // 新しい画像がある場合
        updateData.images = [
          {
            url: uploadedImageUrl,
            altText: altText,
            isFeatured: true,
          },
        ];
      } else if (image) {
        // 既存の画像を維持する場合
        updateData.images = [
          {
            id: image.id, // 既存の画像IDを保持
            url: image.url,
            altText: altText,
            isFeatured: true,
          },
        ];
      } else {
        // 画像を削除する場合
        updateData.images = [];
      }

      console.log("Updating article with data:", updateData);

      // 記事を更新 - スラッグをエンコードして使用
      const encodedSlug = encodeURIComponent(slug);
      console.log("Encoded slug for API call:", encodedSlug);

      // タイムアウト付きでリクエスト実行
      const response = await fetchWithTimeout(
        `/api/articles/${encodedSlug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
        30000 // 30秒タイムアウト
      );

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

      // 保存成功フラグをセット
      setSaveSuccess(true);

      // 少し待機してから遷移
      setTimeout(() => {
        // 成功したら保持していたフィルター状態で元のページに戻る
        navigateBack();
      }, 100);
    } catch (error: unknown) {
      console.error("Article save error:", error);
      // エラーメッセージをより詳細に表示
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError(
            "リクエストがタイムアウトしました。データベース接続に問題がある可能性があります。"
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("不明なエラーが発生しました");
      }
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
      const encodedSlug = encodeURIComponent(slug);

      // タイムアウト付きのリクエスト
      const response = await fetchWithTimeout(
        `/api/articles/${encodedSlug}`,
        { method: "DELETE" },
        30000
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || data.details || "記事の削除に失敗しました"
        );
      }

      setSaveSuccess(true);

      // ローカルストレージのドラフトをクリア
      localStorage.removeItem(`article_draft_${slug}`);

      // 少し待機してから遷移
      setTimeout(() => {
        // 削除成功後も元のページに戻る
        navigateBack();
      }, 100);
    } catch (error: unknown) {
      console.error("Article delete error:", error);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError(
            "削除リクエストがタイムアウトしました。データベース接続に問題がある可能性があります。"
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("不明なエラーが発生しました");
      }
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
          </div>

          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">
              要約
            </label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="記事の要約..."
              className="h-20"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              本文*
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="記事の本文..."
              className="h-40"
              required
              disabled={saving}
            />
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

          {/* デバッグ情報 */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 border p-2 mt-4">
              <p>デバッグ情報:</p>
              <p>戻り先パス: {returnPath}</p>
              <p>カテゴリ: {returnCategory}</p>
              <p>検索: {returnSearch}</p>
              <p>ページ: {returnPage}</p>
            </div>
          )}

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
  );
}
