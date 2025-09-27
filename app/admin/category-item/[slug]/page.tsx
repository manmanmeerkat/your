// app/admin/category-item/[slug]/page.tsx - 修正版
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

// 🔧 画像データのインターface
interface ImageData {
  id?: string;
  url: string;
  altText: string;
  isFeatured?: boolean;
}

// 🆕 Trivia関連の型定義
export interface CategoryItemTrivia {
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
  categoryItemId: string;
}

// 🔧 既存のCategoryItem型に一口メモを追加
interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  published: boolean;
  images?: ImageData[];
  trivia?: CategoryItemTrivia[];
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
  const [currentImageId, setCurrentImageId] = useState<string | null>(null); // 🆕 画像IDを追跡
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 🆕 Trivia関連の状態
  const [categoryItem, setCategoryItem] = useState<CategoryItem | null>(null);
  const [expandedTrivia, setExpandedTrivia] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingTrivia, setEditingTrivia] = useState<{
    [key: string]: string | null;
  }>({});
  const [triviaLoading, setTriviaLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingTriviaData, setEditingTriviaData] = useState<{
    [key: string]: Partial<CategoryItemTrivia>;
  }>({});

  const router = useRouter();

  // 本番環境URLの生成
  const productionUrl = `https://www.yoursecretjapan.com/category-item/${slug}`;

  // URLコピー機能
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

        // 🆕 categoryItemを設定（trivia情報を含む）
        setCategoryItem(data);

        if (data.images && data.images.length > 0) {
          const featuredImage =
            data.images.find((img: ImageData) => img.isFeatured) ||
            data.images[0];
          setCurrentImageUrl(featuredImage.url);
          setCurrentImageId(featuredImage.id); // 🆕 画像IDを保存
          setAltText(featuredImage.altText || "");
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

      // 🔧 ファイル選択時のリセット処理
      // （新しいファイルが選択されたので、プレビューを更新）
    }
  };

  // 🔧 画像アップロード関数（画像管理システム対応）
  const uploadImage = async (): Promise<ImageData | null> => {
    if (!file) return null;

    setUploading(true);
    console.log("🖼️ 画像アップロード開始...");

    try {
      // FormDataオブジェクトを作成
      const formData = new FormData();
      formData.append("file", file);

      console.log("📁 FormDataを作成:", file.name, file.type, file.size);

      // 🆕 カテゴリ項目専用の画像アップロードAPIを使用
      const uploadResponse = await fetch(
        `/api/category-items/${params.slug}/images`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!uploadResponse.ok) {
        // 🔄 フォールバック: 従来のアップロードAPIを使用
        console.log("🔄 カテゴリ項目専用APIが失敗、従来APIにフォールバック");

        const fallbackResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.url) {
          const imageData: ImageData = {
            url: fallbackData.url,
            altText: altText || title,
            isFeatured: true,
          };
          console.log("✅ フォールバックアップロード成功:", imageData);
          return imageData;
        }

        throw new Error(fallbackData.error || "アップロードに失敗しました");
      }

      const uploadData = await uploadResponse.json();
      console.log("📤 アップロードレスポンス:", uploadData);

      if (uploadData.image) {
        const imageData: ImageData = {
          id: uploadData.image.id,
          url: uploadData.image.url,
          altText: uploadData.image.altText,
          isFeatured: true,
        };
        console.log("✅ 画像管理システムアップロード成功:", imageData);
        return imageData;
      }

      throw new Error("画像データが返されませんでした");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("💥 画像アップロードエラー:", error);
      toast.error(`画像アップロードエラー: ${errorMessage}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // キャッシュ無効化関数
  const revalidateCache = async () => {
    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag: "gods-data",
          path: "/mythology",
        }),
      });

      if (response.ok) {
        console.log("✅ キャッシュ無効化完了");
      } else {
        console.warn("⚠️ キャッシュ無効化に失敗");
      }
    } catch (error) {
      console.warn("⚠️ キャッシュ無効化エラー:", error);
    }
  };

  // 🆕 Trivia関連のハンドラー関数
  const toggleTriviaSection = (categoryItemId: string) => {
    setExpandedTrivia((prev) => ({
      ...prev,
      [categoryItemId]: !prev[categoryItemId],
    }));
  };

  const startCreatingTrivia = (categoryItemId: string) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [categoryItemId]: "new",
    }));

    setEditingTriviaData((prev) => ({
      ...prev,
      [categoryItemId]: {
        title: "",
        content: "",
        category: "default",
        tags: [],
        iconEmoji: null,
        colorTheme: null,
        displayOrder: 0,
        isActive: true,
        categoryItemId: categoryItemId,
      },
    }));
  };

  const startEditingTrivia = (categoryItemId: string, triviaId: string) => {
    const trivia = categoryItem?.trivia?.find((t) => t.id === triviaId);
    if (!trivia) return;

    setEditingTrivia((prev) => ({
      ...prev,
      [categoryItemId]: triviaId,
    }));

    setEditingTriviaData((prev) => ({
      ...prev,
      [categoryItemId]: {
        title: trivia.title,
        content: trivia.content,
        contentEn: trivia.contentEn,
        category: trivia.category,
        tags: trivia.tags,
        iconEmoji: trivia.iconEmoji,
        colorTheme: trivia.colorTheme,
        displayOrder: trivia.displayOrder,
        isActive: trivia.isActive,
        categoryItemId: trivia.categoryItemId,
      },
    }));
  };

  const cancelEditingTrivia = (categoryItemId: string) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [categoryItemId]: null,
    }));
    setEditingTriviaData((prev) => ({
      ...prev,
      [categoryItemId]: {},
    }));
  };

  const updateTriviaData = (
    categoryItemId: string,
    field: string,
    value: string | boolean | string[]
  ) => {
    setEditingTriviaData((prev) => ({
      ...prev,
      [categoryItemId]: {
        ...prev[categoryItemId],
        [field]: value,
      },
    }));
  };

  const saveTrivia = async (categoryItemId: string) => {
    const data = editingTriviaData[categoryItemId];
    if (!data || !data.title || !data.content) {
      toast.error("タイトルとコンテンツは必須です");
      return;
    }

    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const isEditing = editingTrivia[categoryItemId] !== "new";
      const url = isEditing
        ? `/api/trivia/${editingTrivia[categoryItemId]}`
        : "/api/trivia";

      const method = isEditing ? "PUT" : "POST";

      const triviaData = {
        ...data,
        categoryItemId: categoryItemId,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(triviaData),
      });

      if (!response.ok) {
        throw new Error("一口メモの保存に失敗しました");
      }

      const savedTrivia = await response.json();

      // ローカル状態を更新
      if (categoryItem) {
        const updatedTrivia = isEditing
          ? categoryItem.trivia?.map((t) =>
              t.id === savedTrivia.id ? savedTrivia : t
            ) || []
          : [...(categoryItem.trivia || []), savedTrivia];

        setCategoryItem((prev) =>
          prev
            ? {
                ...prev,
                trivia: updatedTrivia,
              }
            : null
        );
      }

      cancelEditingTrivia(categoryItemId);
      toast.success("一口メモを保存しました");
    } catch (error) {
      console.error("Trivia save error:", error);
      toast.error(
        error instanceof Error ? error.message : "一口メモの保存に失敗しました"
      );
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
    }
  };

  const deleteTrivia = async (categoryItemId: string, triviaId: string) => {
    if (!confirm("この一口メモを削除しますか？")) return;

    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("一口メモの削除に失敗しました");
      }

      // ローカル状態を更新
      if (categoryItem) {
        setCategoryItem((prev) =>
          prev
            ? {
                ...prev,
                trivia: prev.trivia?.filter((t) => t.id !== triviaId) || [],
              }
            : null
        );
      }

      toast.success("一口メモを削除しました");
    } catch (error) {
      console.error("Trivia delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "一口メモの削除に失敗しました"
      );
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
    }
  };

  const toggleTriviaActive = async (
    categoryItemId: string,
    triviaId: string,
    isActive: boolean
  ) => {
    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("一口メモの状態変更に失敗しました");
      }

      const updatedTrivia = await response.json();

      // ローカル状態を更新
      if (categoryItem) {
        setCategoryItem((prev) =>
          prev
            ? {
                ...prev,
                trivia:
                  prev.trivia?.map((t) =>
                    t.id === triviaId ? updatedTrivia : t
                  ) || [],
              }
            : null
        );
      }

      toast.success(`一口メモを${isActive ? "有効" : "無効"}にしました`);
    } catch (error) {
      console.error("Trivia toggle error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "一口メモの状態変更に失敗しました"
      );
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
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

      // 🔧 画像をアップロード（新しいファイルがある場合のみ）
      let newImageData: ImageData | null = null;
      if (file) {
        console.log("🆕 新しい画像ファイルあり、アップロード処理を開始");
        newImageData = await uploadImage();

        if (newImageData) {
          console.log("✅ 新しい画像データを設定:", newImageData);
        } else {
          console.warn(
            "⚠️ 画像アップロードに失敗しましたが、項目更新を続行します"
          );
        }
      }

      // 🔧 カテゴリ項目データを準備（画像管理システム対応）
      const categoryItemData: {
        title: string;
        slug: string;
        description: string;
        content: string;
        category: string;
        published: boolean;
        updateImages: boolean;
        images?: ImageData[];
      } = {
        title,
        slug,
        description,
        content,
        category,
        published,
        updateImages: false, // 🔧 デフォルトは false（既存画像を保持）
      };

      // 🔧 画像更新の判定
      if (newImageData) {
        // 新しい画像がアップロードされた場合
        categoryItemData.updateImages = true;
        categoryItemData.images = [newImageData];
        console.log("🆕 新しい画像をフィーチャー画像として設定");
      } else if (currentImageId && altText !== (currentImageUrl ? "" : "")) {
        // 既存画像の代替テキストが変更された場合
        if (currentImageUrl) {
          categoryItemData.updateImages = true;
          categoryItemData.images = [
            {
              id: currentImageId,
              url: currentImageUrl,
              altText: altText,
              isFeatured: true,
            },
          ];
          console.log("🔧 既存画像の代替テキストを更新");
        }
      } else {
        console.log("📷 画像に変更なし（既存画像を保持）");
      }

      console.log(
        "📤 送信するカテゴリ項目データ:",
        JSON.stringify(categoryItemData, null, 2)
      );

      // カテゴリ項目更新APIを呼び出し
      const response = await fetch(`/api/category-items/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(categoryItemData),
      });

      console.log(
        "📡 カテゴリ項目更新APIレスポンスステータス:",
        response.status
      );

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("💥 予期しないレスポンス形式:", text);
        throw new Error("APIから予期しないレスポンス形式が返されました");
      }

      const data = await response.json();
      console.log("📨 カテゴリ項目更新APIレスポンス:", data);

      if (!response.ok) {
        throw new Error(data.error || "カテゴリ項目の更新に失敗しました");
      }

      console.log("✅ カテゴリ項目更新成功:", data);
      toast.success("カテゴリ項目を更新しました");

      // 🔧 アップロード済み画像データをリセット
      setFile(null);
      setPreviewUrl(null);

      // キャッシュを無効化
      await revalidateCache();

      // カテゴリ項目管理ページに戻る
      router.push("/admin/category-item");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("💥 カテゴリ項目更新エラー:", error);
      setError(errorMessage);
      toast.error(`エラー: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 TriviaSectionコンポーネント
  const TriviaSection = ({
    categoryItem,
    expandedTrivia,
    editingTrivia,
    triviaLoading,
    toggleTriviaSection,
    startCreatingTrivia,
  }: {
    categoryItem: CategoryItem;
    expandedTrivia: { [key: string]: boolean };
    editingTrivia: { [key: string]: string | null };
    triviaLoading: { [key: string]: boolean };
    toggleTriviaSection: (categoryItemId: string) => void;
    startCreatingTrivia: (categoryItemId: string) => void;
  }) => {
    const isExpanded = expandedTrivia[categoryItem.id];
    const isEditing = editingTrivia[categoryItem.id];

    // 一口メモの数を正確にカウント
    const activeTriviaCount =
      categoryItem.trivia?.filter((t) => t.isActive).length || 0;
    const totalTriviaCount = categoryItem.trivia?.length || 0;

    return (
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => toggleTriviaSection(categoryItem.id)}
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
              onClick={() => startCreatingTrivia(categoryItem.id)}
              disabled={triviaLoading[categoryItem.id]}
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
                key={`trivia-edit-${categoryItem.id}-${
                  editingTrivia[categoryItem.id]
                }`}
                categoryItemId={categoryItem.id}
              />
            )}

            {/* 一口メモリスト */}
            {categoryItem.trivia && categoryItem.trivia.length > 0 ? (
              <div className="space-y-3">
                {/* アクティブな一口メモ */}
                {categoryItem.trivia
                  .filter((trivia) => trivia.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((trivia) => (
                    <TriviaDisplay
                      key={`active-${trivia.id}`}
                      categoryItemId={categoryItem.id}
                      trivia={trivia}
                      categoryItem={categoryItem}
                    />
                  ))}

                {/* 非アクティブな一口メモ（折りたたみ可能） */}
                {categoryItem.trivia.filter((trivia) => !trivia.isActive)
                  .length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
                      <span>
                        非アクティブな一口メモ (
                        {
                          categoryItem.trivia.filter(
                            (trivia) => !trivia.isActive
                          ).length
                        }
                        件)
                      </span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      {categoryItem.trivia
                        .filter((trivia) => !trivia.isActive)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((trivia) => (
                          <div
                            key={`inactive-${trivia.id}`}
                            className="opacity-60"
                          >
                            <TriviaDisplay
                              categoryItemId={categoryItem.id}
                              trivia={trivia}
                              categoryItem={categoryItem}
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
                        カテゴリ項目に関連する豆知識や補足情報を追加できます
                      </p>
                    </div>
                    <Button
                      onClick={() => startCreatingTrivia(categoryItem.id)}
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
            {triviaLoading[categoryItem.id] && (
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

  // 🆕 TriviaEditFormコンポーネント
  const TriviaEditForm = ({ categoryItemId }: { categoryItemId: string }) => {
    const data = editingTriviaData[categoryItemId];
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
          {/* タイトル入力フィールド */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) =>
                updateTriviaData(categoryItemId, "title", e.target.value)
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
                updateTriviaData(categoryItemId, "category", e.target.value)
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

          {/* コンテンツ */}
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
              <MarkdownPreview content={data.content || ""} />
            ) : (
              <textarea
                value={data.content}
                onChange={(e) =>
                  updateTriviaData(categoryItemId, "content", e.target.value)
                }
                placeholder="一口メモの内容をマークダウン記法で入力してください。&#10;&#10;例：&#10;**蝉丸神社**は滋賀県大津市にある神社で、*音楽の神様*として知られています。&#10;&#10;- 能楽の祖とされる蝉丸を祀る&#10;- 音楽・芸能関係者の参拝が多い&#10;- 逢坂の関の近くに位置する"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={8}
                maxLength={2000}
              />
            )}

            <div className="mt-2 text-sm text-gray-600">
              <p className="mb-1">マークダウン記法が使用できます：</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <code>**太字**</code> → <strong>太字</strong>
                </div>
                <div>
                  <code>*斜体*</code> → <em>斜体</em>
                </div>
                <div>
                  <code># 見出し1</code> →{" "}
                  <span className="text-lg font-bold">見出し1</span>
                </div>
                <div>
                  <code>## 見出し2</code> →{" "}
                  <span className="text-base font-semibold">見出し2</span>
                </div>
                <div>
                  <code>- リスト項目</code> → <span>• リスト項目</span>
                </div>
                <div>
                  <code>[リンク](URL)</code> →{" "}
                  <span className="text-blue-600 underline">リンク</span>
                </div>
              </div>
            </div>
          </div>

          {/* アクション */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cancelEditingTrivia(categoryItemId)}
              className="hover:bg-gray-50"
            >
              <X className="h-3 w-3 mr-1" />
              キャンセル
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => saveTrivia(categoryItemId)}
              disabled={triviaLoading[categoryItemId]}
              className="hover:bg-green-600"
            >
              {triviaLoading[categoryItemId] ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 🆕 TriviaDisplayコンポーネント
  const TriviaDisplay = ({
    categoryItemId,
    trivia,
    categoryItem,
  }: {
    categoryItemId: string;
    trivia: CategoryItemTrivia;
    categoryItem: CategoryItem;
  }) => {
    return (
      <div className="bg-gray-50 border rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{trivia.title}</h4>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  trivia.isActive
                    ? "bg-green-100 text-green-800"
                    : categoryItem.trivia && categoryItem.trivia.length === 1
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {trivia.isActive
                  ? "アクティブ"
                  : categoryItem.trivia && categoryItem.trivia.length === 1
                  ? "唯一の一口メモ"
                  : "非アクティブ"}
              </span>
              <span className="text-xs text-gray-500">
                カテゴリ: {trivia.category}
              </span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              <div className="max-h-20 overflow-hidden">
                {trivia.content.length > 150
                  ? `${trivia.content.substring(0, 150)}...`
                  : trivia.content}
              </div>
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => startEditingTrivia(categoryItemId, trivia.id)}
              disabled={triviaLoading[categoryItemId]}
              className="hover:bg-blue-50"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                toggleTriviaActive(categoryItemId, trivia.id, !trivia.isActive)
              }
              disabled={triviaLoading[categoryItemId]}
              className={`hover:bg-yellow-50 ${
                trivia.isActive ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {trivia.isActive ? "無効" : "有効"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => deleteTrivia(categoryItemId, trivia.id)}
              disabled={triviaLoading[categoryItemId]}
              className="hover:bg-red-50 text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
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

          {/* 本番環境URL表示 */}
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

            {/* 🔧 画像プレビューの改善 */}
            {(previewUrl || currentImageUrl) && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">
                  {previewUrl ? "新しい画像プレビュー:" : "現在の画像:"}
                </p>
                <Image
                  src={previewUrl || currentImageUrl || ""}
                  alt="プレビュー"
                  width={400}
                  height={300}
                  className="max-w-full h-auto max-h-40 rounded-md object-cover"
                />
                {previewUrl && (
                  <p className="text-xs text-blue-600 mt-1">
                    ※ 保存後に新しい画像が適用されます
                  </p>
                )}
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

          {/* 🆕 Trivia機能セクション */}
          {categoryItem && (
            <TriviaSection
              categoryItem={categoryItem}
              expandedTrivia={expandedTrivia}
              editingTrivia={editingTrivia}
              triviaLoading={triviaLoading}
              toggleTriviaSection={toggleTriviaSection}
              startCreatingTrivia={startCreatingTrivia}
            />
          )}

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
