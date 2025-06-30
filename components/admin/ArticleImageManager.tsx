// components/admin/ArticleImageManager.tsx - フィーチャー画像設定修正版
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ArticleImage {
  id: string;
  url: string;
  altText?: string;
  isFeatured: boolean;
  createdAt: string;
}

interface ArticleImageManagerProps {
  articleId: string;
}

export function ArticleImageManager({ articleId }: ArticleImageManagerProps) {
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [deleting, setDeleting] = useState<string>(""); // 削除中の画像ID

  // 🎉 成功メッセージの表示
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // 📖 画像一覧を取得
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = `/api/images?articleId=${encodeURIComponent(articleId)}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        setError("");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        setError(`画像の取得に失敗しました: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      console.error("❌ 画像取得エラー:", error);
      setError(`画像の取得中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // 📤 画像アップロード（フィーチャー画像自動設定を防止）
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // 🔧 現在のフィーチャー画像の状態を保存
      const currentFeaturedImage = images.find((img) => img.isFeatured);
      const hasFeaturedImage = currentFeaturedImage !== undefined;

      console.log("アップロード開始:", {
        fileCount: files.length,
        hasFeaturedImage,
        currentFeaturedImageId: currentFeaturedImage?.id,
      });

      const uploadPromises = Array.from(files).map(async (file) => {
        // ファイルサイズチェック（クライアント側）
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}: ファイルサイズが10MBを超えています`);
        }

        // ファイル形式チェック（クライアント側）
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `${file.name}: サポートされていない画像形式です (${file.type})`
          );
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("altText", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("articleId", articleId);

        // 🔧 既存のフィーチャー画像がある場合は、新しい画像を非フィーチャーに設定
        formData.append("isFeatured", hasFeaturedImage ? "false" : "true");

        console.log("個別ファイルアップロード:", {
          fileName: file.name,
          willBeFeatured: !hasFeaturedImage,
        });

        const apiUrl = `/api/images`;

        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || `HTTP ${response.status}`;
          throw new Error(`${file.name}: ${errorMessage}`);
        }

        const result = await response.json();
        console.log("アップロード成功:", {
          fileName: file.name,
          imageId: result.image?.id,
          isFeatured: result.image?.isFeatured,
        });

        return result;
      });

      const results = await Promise.all(uploadPromises);

      // 🔧 アップロード成功後のメッセージ
      if (hasFeaturedImage) {
        showSuccess(
          `${files.length}枚の画像をアップロードしました！（既存のフィーチャー画像は維持されます）`
        );
      } else {
        showSuccess(
          `${files.length}枚の画像をアップロードしました！${
            files.length === 1
              ? "この画像がフィーチャー画像に設定されました。"
              : "最初の画像がフィーチャー画像に設定されました。"
          }`
        );
      }

      await fetchImages(); // 画像一覧を再取得
      e.target.value = ""; // ファイル選択をリセット

      console.log("アップロード完了:", {
        uploadedCount: results.length,
        featuredImageMaintained: hasFeaturedImage,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "アップロードに失敗しました";
      console.error("❌ アップロードエラー:", error);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ 画像削除
  const handleImageDelete = async (imageId: string, imageUrl: string) => {
    const fileName = imageUrl.split("/").pop() || "この画像";
    const imageToDelete = images.find((img) => img.id === imageId);
    const isFeaturedImage = imageToDelete?.isFeatured;

    let confirmMessage = `「${fileName}」を削除しますか？\n\n※この操作は取り消せません。記事内で使用中の場合は手動で削除が必要です。`;

    if (isFeaturedImage) {
      confirmMessage +=
        "\n\n⚠️ この画像は現在フィーチャー画像に設定されています。削除すると他の画像が自動的にフィーチャー画像になる場合があります。";
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(imageId);
    setError("");
    setSuccess("");

    try {
      console.log("画像削除開始:", {
        imageId,
        fileName,
        isFeaturedImage,
      });

      const apiUrl = `/api/images?imageId=${encodeURIComponent(
        imageId
      )}&articleId=${encodeURIComponent(articleId)}`;

      const response = await fetch(apiUrl, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        if (isFeaturedImage && images.length > 1) {
          showSuccess(
            `フィーチャー画像「${fileName}」を削除しました。他の画像がフィーチャー画像に設定される場合があります。`
          );
        } else {
          showSuccess(`画像「${fileName}」を削除しました`);
        }
        await fetchImages(); // 画像一覧を再取得

        console.log("画像削除完了:", { imageId, fileName });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        setError(`画像の削除に失敗しました: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "削除中にエラーが発生しました";
      setError(errorMessage);
    } finally {
      setDeleting("");
    }
  };

  // ⭐ フィーチャー画像の設定/解除（改善版）
  const handleFeatureToggle = async (
    imageId: string,
    currentFeatured: boolean
  ) => {
    setError("");
    setSuccess("");

    // 🔧 フィーチャー画像解除の場合の確認
    if (currentFeatured) {
      const otherImages = images.filter((img) => img.id !== imageId);
      if (otherImages.length === 0) {
        if (
          !confirm(
            "この画像を非フィーチャーにすると、記事にフィーチャー画像がなくなります。続行しますか？"
          )
        ) {
          return;
        }
      } else {
        if (
          !confirm(
            "この画像のフィーチャー設定を解除しますか？\n\n他の画像を手動でフィーチャー画像に設定することをお勧めします。"
          )
        ) {
          return;
        }
      }
    } else {
      // 🔧 フィーチャー画像設定の場合の確認
      const currentFeaturedImage = images.find((img) => img.isFeatured);
      if (currentFeaturedImage) {
        if (
          !confirm(
            `この画像をフィーチャー画像に設定しますか？\n\n現在のフィーチャー画像（${
              currentFeaturedImage.altText || "タイトルなし"
            }）は非フィーチャーになります。`
          )
        ) {
          return;
        }
      }
    }

    try {
      console.log("フィーチャー画像設定変更開始:", {
        imageId,
        currentFeatured,
        newFeatured: !currentFeatured,
      });

      const apiUrl = `/api/images?imageId=${encodeURIComponent(
        imageId
      )}&articleId=${encodeURIComponent(articleId)}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
        credentials: "include",
      });

      if (response.ok) {
        if (currentFeatured) {
          showSuccess("フィーチャー画像を解除しました");
        } else {
          showSuccess("フィーチャー画像に設定しました");
        }
        await fetchImages();

        console.log("フィーチャー画像設定変更完了:", {
          imageId,
          success: true,
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        setError(`フィーチャー画像の設定に失敗しました: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "フィーチャー設定中にエラーが発生しました";
      setError(errorMessage);
    }
  };

  // 📋 マークダウンをクリップボードにコピー
  const copyImageMarkdown = async (image: ArticleImage) => {
    const markdown = `![${image.altText || "image"}](${image.url})`;

    try {
      await navigator.clipboard.writeText(markdown);
      showSuccess("マークダウンをクリップボードにコピーしました！");
    } catch {
      // フォールバック: テキストエリアを使用
      const textArea = document.createElement("textarea");
      textArea.value = markdown;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      showSuccess("マークダウンをコピーしました！");
    }
  };

  // 🔄 手動更新
  const handleRefresh = () => {
    fetchImages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none overflow-hidden">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          画像管理 ({images.length}枚)
          {images.filter((img) => img.isFeatured).length > 0 && (
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              ⭐ フィーチャー: {images.filter((img) => img.isFeatured).length}枚
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
          <div className="text-xs text-gray-500">
            ID: {articleId.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* 成功メッセージ */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start gap-2">
          <div className="text-green-500">✅</div>
          <div className="font-medium">{success}</div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">エラーが発生しました</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* 🔧 フィーチャー画像に関する説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          ℹ️ フィーチャー画像について
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            • 📌 <strong>新規アップロード時</strong>:
            既存のフィーチャー画像がある場合は維持されます
          </p>
          <p>
            • ⭐ <strong>フィーチャー画像なしの場合</strong>:
            最初にアップロードした画像が自動的にフィーチャー画像になります
          </p>
          <p>
            • 🔄 <strong>フィーチャー画像変更</strong>:
            ⭐ボタンで手動で設定・解除できます（1記事につき1枚まで）
          </p>
          <p>
            • 🗑️ <strong>フィーチャー画像削除時</strong>:
            他の画像が自動的にフィーチャー画像になる場合があります
          </p>
        </div>
      </div>

      {/* 🔧 画像の並び順に関する説明（修正版） */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">
          📋 画像の並び順について
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            • 🕒 <strong>表示順序</strong>:
            アップロードした順（古いものから順番）で表示されます
          </p>
          <p>
            • ⭐ <strong>フィーチャー画像</strong>:
            黄色い枠と星マークで視覚的に強調表示されます
          </p>
          <p>
            • 🔢 <strong>番号</strong>:
            左上の番号は表示順を示します（フィーチャー画像には⭐マークも表示）
          </p>
          <p>
            • 📅 <strong>新規画像</strong>:
            新しくアップロードした画像は一覧の最後に追加されます
          </p>
        </div>
      </div>

      {/* アップロードセクション */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label
              htmlFor="image-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "📤 アップロード中..." : "📁 画像をアップロード"}
            </Label>
            <Input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            PNG, JPG, GIF, WebP (最大10MB、複数選択可)
          </p>
          {/* 🔧 フィーチャー画像に関する注意書きを更新 */}
          {images.filter((img) => img.isFeatured).length > 0 ? (
            <p className="mt-1 text-xs text-blue-600">
              💡 既存のフィーチャー画像は維持されます
            </p>
          ) : (
            <p className="mt-1 text-xs text-yellow-600">
              💡
              最初にアップロードした画像がフィーチャー画像になります（一覧の最後に追加されます）
            </p>
          )}
          {uploading && (
            <div className="mt-3">
              <div className="bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 画像一覧 */}
      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="font-medium">まだ画像がアップロードされていません</p>
          <p className="text-sm mt-1">
            上のアップロードエリアから画像を追加してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {/* 🔧 アップロード順（作成日時昇順）で表示、古いものが先頭 */}
          {images
            .sort((a, b) => {
              // 作成日時の昇順（古いものが先）でソート
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            })
            .map((image, index) => (
              <EnhancedImageCard
                key={image.id}
                image={image}
                index={index + 1}
                isDeleting={deleting === image.id}
                onDelete={() => handleImageDelete(image.id, image.url)}
                onFeatureToggle={() =>
                  handleFeatureToggle(image.id, image.isFeatured)
                }
                onCopyMarkdown={() => copyImageMarkdown(image)}
              />
            ))}
        </div>
      )}

      {/* 使用方法ガイド */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 画像の使用方法</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• 「📋 マークダウンコピー」ボタンでクリップボードにコピー</p>
          <p>
            • 基本形式:{" "}
            <code className="bg-blue-100 px-1 rounded">
              ![代替テキスト](画像URL)
            </code>
          </p>
          <p>
            • サイズ指定形式:{" "}
            <code className="bg-blue-100 px-1 rounded">
              ![代替テキスト](画像URL){`{width=300 height=200}`}
            </code>
          </p>
          <p>
            • 幅のみ指定:{" "}
            <code className="bg-blue-100 px-1 rounded">
              ![代替テキスト](画像URL){`{width=300}`}
            </code>
          </p>
          <p>
            • 高さのみ指定:{" "}
            <code className="bg-blue-100 px-1 rounded">
              ![代替テキスト](画像URL){`{height=200}`}
            </code>
          </p>
          <p>• ⭐マークでフィーチャー画像を設定（記事一覧などで表示）</p>
          <p>• 🗑️ ボタンで画像を削除（記事内で使用中の場合は手動削除が必要）</p>
        </div>
      </div>

      {/* 統計情報 */}
      {images.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">📊 画像統計</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">総画像数:</span>
              <span className="ml-2 font-medium">{images.length}枚</span>
            </div>
            <div>
              <span className="text-gray-600">フィーチャー画像:</span>
              <span className="ml-2 font-medium">
                {images.filter((img) => img.isFeatured).length}枚
              </span>
            </div>
            <div>
              <span className="text-gray-600">最新アップロード:</span>
              <span className="ml-2 font-medium">
                {images.length > 0
                  ? new Date(
                      Math.max(
                        ...images.map((img) =>
                          new Date(img.createdAt).getTime()
                        )
                      )
                    ).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">記事ID:</span>
              <span className="ml-2 font-mono text-xs">
                {articleId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🖼️ 強化された画像カードコンポーネント（フィーチャー画像表示改善）
interface EnhancedImageCardProps {
  image: ArticleImage;
  index: number;
  isDeleting: boolean;
  onDelete: () => void;
  onFeatureToggle: () => void;
  onCopyMarkdown: () => void;
}

function EnhancedImageCard({
  image,
  index,
  isDeleting,
  onDelete,
  onFeatureToggle,
  onCopyMarkdown,
}: EnhancedImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fileName = image.url.split("/").pop() || "image";
  const fileExtension = fileName.split(".").pop()?.toUpperCase() || "";
  const createdDate = new Date(image.createdAt).toLocaleDateString();

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 w-full ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      } ${image.isFeatured ? "ring-2 ring-yellow-400 ring-opacity-50" : ""}`}
    >
      <div className="relative">
        {/* バッジ */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            #{index}
            {image.isFeatured && (
              <span className="ml-1 text-yellow-300">⭐</span>
            )}
          </span>
        </div>

        {/* 🔧 フィーチャーバッジの改善 */}
        {image.isFeatured && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              <span>フィーチャー</span>
            </div>
          </div>
        )}

        {/* 削除中表示 */}
        {isDeleting && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm font-medium">削除中...</p>
            </div>
          </div>
        )}

        {/* 画像表示 */}
        <div className="relative w-full h-32 sm:h-48 bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent"></div>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">画像読み込みエラー</p>
              </div>
            </div>
          ) : (
            <Image
              src={image.url}
              alt={image.altText || "image"}
              fill
              className={`object-cover transition-opacity duration-200 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* 画像情報 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-900 truncate text-sm flex-1 mr-2">
              {image.altText || "タイトルなし"}
            </p>
            {/* 🔧 フィーチャー画像インジケーターの追加 */}
            {image.isFeatured && (
              <span className="text-yellow-500 text-xs">⭐</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-mono truncate flex-1 mr-2">{fileName}</span>
            <span className="bg-gray-100 px-2 py-1 rounded flex-shrink-0">
              {fileExtension}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{createdDate}</p>
        </div>

        {/* アクションボタン */}
        <div className="space-y-2">
          {/* 主要アクション */}
          <div className="flex gap-1">
            <Button
              onClick={onCopyMarkdown}
              size="sm"
              className="flex-1 text-xs px-2 py-1 h-8"
              disabled={isDeleting}
            >
              📋 マークダウンコピー
            </Button>
          </div>

          {/* 副次アクション */}
          <div className="flex gap-1">
            <Button
              onClick={onFeatureToggle}
              variant="outline"
              size="sm"
              className={`flex-1 text-xs px-2 py-1 h-8 ${
                image.isFeatured
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  : "hover:bg-yellow-50 hover:border-yellow-300"
              }`}
              disabled={isDeleting}
              title={image.isFeatured ? "フィーチャー解除" : "フィーチャー設定"}
            >
              {image.isFeatured ? (
                <>
                  <Star className="h-3 w-3 fill-current mr-1" />
                  解除
                </>
              ) : (
                <>
                  <Star className="h-3 w-3 mr-1" />
                  設定
                </>
              )}
            </Button>

            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-2 py-1 h-8"
              disabled={isDeleting}
              title="画像を削除"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 🔧 フィーチャー画像の説明テキスト */}
        {image.isFeatured && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-medium">フィーチャー画像</span>
            </div>
            <p className="mt-1 text-yellow-700">
              記事一覧やサムネイルとして表示されます
            </p>
          </div>
        )}

        {/* 画像URL（開発時のみ） */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p
              className="text-xs text-gray-400 font-mono truncate"
              title={image.url}
            >
              {image.url}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
