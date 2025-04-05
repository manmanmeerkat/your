"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // 必要に応じて適切なインポート先に変更
import { Loader2 } from "lucide-react"; // アイコンを使用する場合

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("culture"); // デフォルトカテゴリ
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // スラッグの自動生成
  const generateSlug = () => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(generateSlug());
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
    } catch (error: any) {
      console.error("画像アップロードエラー:", error);
      toast.error(`画像アップロードエラー: ${error.message}`);
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
      if (!title || !slug || !content || !category) {
        throw new Error("タイトル、スラッグ、本文、カテゴリーは必須です");
      }

      // 画像をアップロード（ある場合）
      let imageData = null;
      if (file) {
        console.log("画像ファイルあり、アップロード処理を開始");
        imageData = await uploadImage();

        // アップロードに失敗した場合でも続行（オプションとして）
        if (!imageData && file) {
          console.warn(
            "画像アップロードに失敗しましたが、記事作成を続行します"
          );
        }
      }

      // 記事データを準備
      const articleData = {
        title,
        slug,
        summary,
        content,
        category,
        published,
        // 画像データがある場合のみimages配列に追加
        images: imageData ? [imageData] : [],
      };

      console.log("送信する記事データ:", JSON.stringify(articleData, null, 2));

      // 記事作成APIを呼び出し
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      console.log("記事作成APIレスポンスステータス:", response.status);

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("予期しないレスポンス形式:", text);
        throw new Error("APIから予期しないレスポンス形式が返されました");
      }

      const data = await response.json();
      console.log("記事作成APIレスポンス:", data);

      if (!response.ok) {
        throw new Error(data.error || "記事の作成に失敗しました");
      }

      console.log("記事作成成功:", data);
      toast.success("記事を作成しました");

      // 管理画面に戻る
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("記事作成エラー:", error);
      setError(error.message);
      toast.error(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新規記事作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="日本の桜祭り：その歴史と文化"
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
              placeholder="japanese-sakura-festival"
              required
            />
            <p className="text-xs text-gray-500">
              URLの一部として使用されます: your-secret-japan.com/articles/{slug}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">
              要約
            </label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="日本の桜祭りについての要約..."
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
              placeholder="日本の桜祭りは..."
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
              <option value="culture">文化・伝統</option>
              <option value="mythology">神話</option>
              <option value="customs">習慣</option>
              <option value="festivals">祭り</option>
            </select>
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
                placeholder="日本の桜祭りの風景"
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
            <Button type="submit" disabled={loading || uploading}>
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
        </form>
      </CardContent>
    </Card>
  );
}
