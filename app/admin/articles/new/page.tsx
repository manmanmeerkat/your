"use client";

import { useState } from "react";
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
  const [description, setDescription] = useState(""); // 説明文フィールド（SEO用）
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("culture"); // デフォルトカテゴリ
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoUpdateSummary, setAutoUpdateSummary] = useState(true); // 要約自動更新の制御
  const router = useRouter();

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
    result = result.replace(/```[\s\S]*?```/g, ""); // コードブロック
    result = result.replace(/`([^`]+)`/g, "$1"); // 行内コード

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

  // コンテンツの変更ハンドラー - マークダウンから自動要約を生成
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // 自動要約機能がオンの場合、マークダウンを削除して要約欄を更新
    if (autoUpdateSummary) {
      setSummary(stripMarkdown(newContent));
    }
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
        description, // 説明文フィールド
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("記事作成エラー:", error);
      setError(errorMessage);
      toast.error(`エラー: ${errorMessage}`);
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

          {/* 説明文フィールド - SEO・SNS用 */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              説明文
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="日本の桜祭りの短い説明..."
              className="h-20"
            />
            <p className="text-xs text-gray-500">
              検索結果やSNSでの表示に使用されます。150文字以内推奨。
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
              placeholder="日本の桜祭りについての要約..."
              className="h-20"
              disabled={autoUpdateSummary}
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
              placeholder="# 日本の桜祭り\n\n日本の桜祭りは..."
              className="h-40 font-mono"
              required
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
