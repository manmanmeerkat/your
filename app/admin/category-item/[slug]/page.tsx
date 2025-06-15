"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
import Image from "next/image";

const categoryOptions = [
  { value: "about-japanese-gods", label: "About Japanese Gods" },
  { value: "japanese-culture-category", label: "Japanese Culture" },
  { value: "seasonal-festivals", label: "Seasonal Festivals" },
  { value: "japanese-way-of-life", label: "Japanese Way of Life" },
];

interface CategoryItemEditProps {
  params: {
    slug: string;
  };
}

export default function EditCategoryItemPage({
  params,
}: CategoryItemEditProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("about-japanese-gods");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // 🚨 新機能：本番環境URLの生成
  const productionUrl = `https://www.yoursecretjapan.com/category-item/${slug}`;

  // 🚨 新機能：URLコピー機能
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(productionUrl);
      setCopied(true);
      toast.success("URLをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("URLのコピーに失敗しました");
    }
  };

  // 既存データの読み込み
  useEffect(() => {
    const fetchCategoryItem = async () => {
      try {
        const response = await fetch(`/api/category-items/${params.slug}`);

        if (!response.ok) {
          throw new Error("カテゴリ項目が見つかりません");
        }

        const data = await response.json();

        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || "");
        setDescription(data.description || "");
        setCategory(data.category);
        setPublished(data.published);

        if (data.images && data.images.length > 0) {
          setCurrentImageUrl(data.images[0].url);
          setAltText(data.images[0].altText || "");
        }
      } catch (error) {
        console.error("Error fetching category item:", error);
        setError(
          error instanceof Error ? error.message : "読み込みに失敗しました"
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategoryItem();
  }, [params.slug]);

  // スラッグの自動生成
  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // プレビュー用のURLを作成
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // デフォルトの代替テキストとしてファイル名を使用
      if (!altText) {
        setAltText(selectedFile.name.split(".")[0]);
      }
    }
  };

  // 画像アップロード関数
  const uploadImage = async () => {
    if (!file) return null;

    setUploading(true);
    console.log("画像アップロード開始...");

    try {
      // FormDataオブジェクトを作成
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormDataを作成:", file.name, file.type, file.size);

      // 画像アップロードAPIを呼び出し
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("アップロードレスポンス状態:", uploadResponse.status);

      // レスポンスを解析
      const uploadData = await uploadResponse.json();
      console.log("アップロードレスポンス:", uploadData);

      // URLが含まれている場合は成功とみなす（エラーメッセージがあっても）
      if (uploadData.url) {
        console.log("アップロード成功:", uploadData.url);
        return {
          url: uploadData.url,
          altText: altText || title,
          isFeatured: true,
        };
      }

      // エラーが返された場合
      if (uploadData.error) {
        throw new Error(uploadData.error || "アップロードに失敗しました");
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("画像アップロードエラー:", error);
      toast.error(`画像アップロードエラー: ${errorMessage}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || uploading) return;

    setLoading(true);
    setError(null);

    try {
      // 必須フィールドの検証
      if (!title || !slug || !category) {
        throw new Error("タイトル、スラッグ、カテゴリーは必須です");
      }

      // 画像をアップロード（ある場合）
      let imageData = null;
      if (file) {
        console.log("画像ファイルあり、アップロード処理を開始");
        imageData = await uploadImage();

        // アップロードに失敗した場合でも続行（オプションとして）
        if (!imageData && file) {
          console.warn(
            "画像アップロードに失敗しましたが、項目更新を続行します"
          );
        }
      }

      // カテゴリ項目データを準備
      const categoryItemData = {
        title,
        slug,
        description,
        content,
        category,
        published,
        imageUrl: imageData ? imageData.url : file ? null : currentImageUrl,
        imageAltText: imageData ? imageData.altText : altText,
      };

      console.log(
        "送信するカテゴリ項目データ:",
        JSON.stringify(categoryItemData, null, 2)
      );

      // カテゴリ項目更新APIを呼び出し
      const response = await fetch(`/api/category-items/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryItemData),
      });

      console.log("カテゴリ項目更新APIレスポンスステータス:", response.status);

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("予期しないレスポンス形式:", text);
        throw new Error("APIから予期しないレスポンス形式が返されました");
      }

      const data = await response.json();
      console.log("カテゴリ項目更新APIレスポンス:", data);

      if (!response.ok) {
        throw new Error(data.error || "カテゴリ項目の更新に失敗しました");
      }

      console.log("カテゴリ項目更新成功:", data);
      toast.success("カテゴリ項目を更新しました");

      // カテゴリ項目管理ページに戻る
      router.push("/admin/category-item");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("カテゴリ項目更新エラー:", error);
      setError(errorMessage);
      toast.error(`エラー: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>カテゴリ項目編集</CardTitle>
      </CardHeader>
      <CardContent>
        <div onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">エラー:</p>
              <p>{error}</p>
            </div>
          )}

          {/* 🚨 新機能：本番環境URL表示 */}
          {slug && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">
                    本番環境URL:
                  </span>
                  {published && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      公開中
                    </span>
                  )}
                  {!published && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      下書き
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2 bg-white border rounded">
                  <code className="flex-1 text-sm text-blue-600 break-all">
                    {productionUrl}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  {published && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(productionUrl, "_blank")}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!published && (
                  <p className="text-xs text-blue-600">
                    ※ 下書き状態のため、公開後にアクセス可能になります
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タイトル*
            </label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Izanagi no Mikoto"
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
              placeholder="izanagi-no-mikoto"
              required
            />
            <p className="text-xs text-gray-500">URLの一部として使用されます</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              カテゴリータイプ*
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              説明文
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The Japanese creator god, father of the islands..."
              className="h-20"
            />
            <p className="text-xs text-gray-500">
              検索結果やSNSでの表示に使用されます。150文字以内推奨。
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              本文 (Markdown記法対応)
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# 見出し1

## 見出し2

The creator god who, with Izanami, birthed the Japanese islands...

**太字** や *斜体* を使用できます。"
              className="h-40 font-mono"
            />
            <p className="text-xs text-gray-500">
              Markdown記法を使用できます。見出し、リスト、コードブロックなど。
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              画像
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {(previewUrl || currentImageUrl) && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">プレビュー:</p>
                <Image
                  src={previewUrl || currentImageUrl || ""}
                  alt="プレビュー"
                  width={400}
                  height={300}
                  className="max-w-full h-auto max-h-40 rounded-md object-cover"
                />
              </div>
            )}
          </div>

          {(file || currentImageUrl) && (
            <div className="space-y-2">
              <label htmlFor="altText" className="text-sm font-medium">
                画像の代替テキスト
              </label>
              <Input
                id="altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Izanagi no Mikoto"
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                "更新"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
