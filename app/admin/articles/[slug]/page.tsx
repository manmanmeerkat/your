"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

export default function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<any | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log("Fetching article with slug:", params.slug);

        if (!params.slug) {
          throw new Error("スラッグが指定されていません");
        }

        const { data: sessionData } = await supabase.auth.getSession();

        const response = await fetch(`/api/articles/${params.slug}`);

        if (!response.ok) {
          throw new Error("記事の取得に失敗しました");
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
      } catch (error: any) {
        console.error("記事取得エラー:", error);
        setError(error.message);
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

      // アップロードリクエスト送信
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "画像のアップロードに失敗しました"
        );
      }

      console.log("Image uploaded successfully:", data.url);
      return data.url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      setError(error.message || "画像のアップロードに失敗しました");
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
    } catch (error: any) {
      console.error("Image delete error:", error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      const updateData: any = {
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

      // 記事を更新 - params.slugを使用
      const response = await fetch(`/api/articles/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "記事の更新に失敗しました"
        );
      }

      // 成功したら管理画面にリダイレクト
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("Article save error:", error);
      setError(error.message || "不明なエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  // 記事の削除処理
  const handleDelete = async () => {
    if (!confirm("本当にこの記事を削除しますか？この操作は元に戻せません。")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${params.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || data.details || "記事の削除に失敗しました"
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("Article delete error:", error);
      setError(error.message || "不明なエラーが発生しました");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>読み込み中...</p>
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
        >
          削除
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

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
                <div className="relative h-40 w-full max-w-xs bg-slate-200 rounded-md overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.altText || "記事画像"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 text-red-600 hover:bg-red-50"
                  onClick={handleDeleteImage}
                >
                  削除
                </Button>
              </div>
            )}

            {/* 新しい画像プレビュー */}
            {preview && (
              <div className="mt-2 relative">
                <div className="relative h-40 w-full max-w-xs bg-slate-200 rounded-md overflow-hidden">
                  <Image
                    src={preview}
                    alt="画像プレビュー"
                    fill
                    style={{ objectFit: "cover" }}
                  />
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
            />
            <label htmlFor="published" className="text-sm font-medium">
              公開する
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving || uploading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
