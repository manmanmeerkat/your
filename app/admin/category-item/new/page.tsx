"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const categoryOptions = [
  { value: "about-japanese-gods", label: "About Japanese Gods" },
  { value: "japanese-culture-category", label: "Japanese Culture" },
  { value: "seasonal-festivals", label: "Seasonal Festivals" },
  { value: "japanese-way-of-life", label: "Japanese Way of Life" },
];

export default function NewCategoryItemPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState(""); // Markdown本文
  const [description, setDescription] = useState(""); // 説明文
  const [category, setCategory] = useState("about-japanese-gods");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
            "画像アップロードに失敗しましたが、項目作成を続行します"
          );
        }
      }

      // カテゴリ項目データを準備（フィールド名を修正）
      const categoryItemData = {
        title,
        slug,
        description, // descriptionをそのまま送信
        content, // contentをそのまま送信
        category,
        published,
        images: imageData ? [imageData] : [],
      };

      console.log(
        "送信するカテゴリ項目データ:",
        JSON.stringify(categoryItemData, null, 2)
      );

      // カテゴリ項目作成APIを呼び出し
      const response = await fetch("/api/category-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryItemData),
      });

      console.log("カテゴリ項目作成APIレスポンスステータス:", response.status);

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("予期しないレスポンス形式:", text);
        throw new Error("APIから予期しないレスポンス形式が返されました");
      }

      const data = await response.json();
      console.log("カテゴリ項目作成APIレスポンス:", data);

      if (!response.ok) {
        throw new Error(data.error || "カテゴリ項目の作成に失敗しました");
      }

      console.log("カテゴリ項目作成成功:", data);
      toast.success("カテゴリ項目を作成しました");

      // カテゴリ項目管理ページに戻る
      router.push("/admin/category-item");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("カテゴリ項目作成エラー:", error);
      setError(errorMessage);
      toast.error(`エラー: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規カテゴリ項目作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">エラー:</p>
              <p>{error}</p>
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
            <p className="text-xs text-gray-500">
              URLの一部として使用されます: your-secret-japan.com/category-item/
              {slug}
            </p>
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

The creator god who, with Izanami, birthed the Japanese islands. 

**太字** や *斜体* を使用できます。

```javascript
const example = 'code block';

リスト項目 1
リスト項目 2"
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

            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">プレビュー:</p>
                <img
                  src={previewUrl}
                  alt="プレビュー"
                  className="max-w-full h-auto max-h-40 rounded-md"
                />
              </div>
            )}
          </div>

          {file && (
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
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
