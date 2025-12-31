"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Plus,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import Image from "next/image";

interface CategoryItemImage {
  id: string;
  url: string;
  altText?: string;
  isFeatured: boolean;
}

interface CategoryItemTrivia {
  id: string;
  title: string;
  content: string;
  contentEn: string | null;
  category: string;
  tags: string[];
  iconEmoji: string | null;
  colorTheme: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryItemId: string;
}

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentEn: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  trivia: CategoryItemTrivia[];
  images?: CategoryItemImage[];
}

export default function CategoryItemsPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrivia, setExpandedTrivia] = useState<Record<string, boolean>>(
    {}
  );
  const [editingTrivia, setEditingTrivia] = useState<
    Record<string, string | null>
  >({});
  const [triviaLoading, setTriviaLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [editingTriviaData, setEditingTriviaData] = useState<
    Record<
      string,
      {
        title?: string;
        content?: string;
        contentEn?: string | null;
        category?: string;
        tags?: string[];
        iconEmoji?: string | null;
        colorTheme?: string | null;
        isActive?: boolean;
      } | null
    >
  >({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/category-items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch category items:", error);
      toast.error("カテゴリアイテムの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const toggleTriviaSection = useCallback((categoryItemId: string) => {
    setExpandedTrivia((prev) => ({
      ...prev,
      [categoryItemId]: !prev[categoryItemId],
    }));
  }, []);

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
        contentEn: null,
        category: "default",
        tags: [],
        iconEmoji: null,
        colorTheme: null,
        isActive: true,
      },
    }));
  };

  const startEditingTrivia = (categoryItemId: string, triviaId: string) => {
    const categoryItem = items.find((item) => item.id === categoryItemId);
    const trivia = categoryItem?.trivia.find((t) => t.id === triviaId);

    if (trivia) {
      setEditingTrivia((prev) => ({
        ...prev,
        [categoryItemId]: triviaId,
      }));
      setEditingTriviaData((prev) => ({
        ...prev,
        [categoryItemId]: {
          title: trivia.title || "",
          content: trivia.content || "",
          contentEn: trivia.contentEn || null,
          category: trivia.category || "default",
          tags: trivia.tags || [],
          iconEmoji: trivia.iconEmoji || null,
          colorTheme: trivia.colorTheme || null,
          isActive: trivia.isActive,
        },
      }));
    }
  };

  const cancelEditingTrivia = (categoryItemId: string) => {
    setEditingTrivia((prev) => ({
      ...prev,
      [categoryItemId]: null,
    }));
    setEditingTriviaData((prev) => ({
      ...prev,
      [categoryItemId]: null,
    }));
  };

  const saveTrivia = async (
    categoryItemId: string,
    data?: {
      title?: string;
      content?: string;
      contentEn?: string | null;
      category?: string;
      tags?: string[];
      iconEmoji?: string | null;
      colorTheme?: string | null;
      isActive?: boolean;
    }
  ) => {
    const triviaData = data || editingTriviaData[categoryItemId];
    if (
      !triviaData ||
      !triviaData.content ||
      triviaData.content.trim() === ""
    ) {
      toast.error("内容を入力してください");
      return;
    }

    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const isEditing = editingTrivia[categoryItemId] !== "new";
      const url = isEditing
        ? `/api/trivia/${editingTrivia[categoryItemId]}`
        : "/api/trivia";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        title: triviaData.title || "",
        content: triviaData.content,
        contentEn: triviaData.contentEn,
        category: triviaData.category || "default",
        tags: triviaData.tags || [],
        iconEmoji: triviaData.iconEmoji,
        colorTheme: triviaData.colorTheme,
        isActive: triviaData.isActive,
        ...(isEditing ? {} : { categoryItemId }),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          isEditing ? "一口メモを更新しました" : "一口メモを作成しました"
        );
        cancelEditingTrivia(categoryItemId);
        fetchItems();
      } else {
        throw new Error("Failed to save trivia");
      }
    } catch (error) {
      console.error("Failed to save trivia:", error);
      toast.error("一口メモの保存に失敗しました");
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
    }
  };

  const deleteTrivia = async (categoryItemId: string, triviaId: string) => {
    const categoryItem = items.find((item) => item.id === categoryItemId);
    const trivia = categoryItem?.trivia.find((t) => t.id === triviaId);

    if (!confirm(`一口メモ「${trivia?.title || "無題"}」を削除しますか？`)) {
      return;
    }

    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("一口メモを削除しました");
        fetchItems();
      } else {
        throw new Error("Failed to delete trivia");
      }
    } catch (error) {
      console.error("Failed to delete trivia:", error);
      toast.error("一口メモの削除に失敗しました");
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
    }
  };

  const toggleTriviaActive = async (
    categoryItemId: string,
    triviaId: string
  ) => {
    const categoryItem = items.find((item) => item.id === categoryItemId);
    const trivia = categoryItem?.trivia.find((t) => t.id === triviaId);

    if (!trivia) return;

    setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: true }));

    try {
      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trivia.title,
          content: trivia.content,
          contentEn: trivia.contentEn,
          category: trivia.category,
          tags: trivia.tags,
          iconEmoji: trivia.iconEmoji,
          colorTheme: trivia.colorTheme,
          isActive: !trivia.isActive,
        }),
      });

      if (response.ok) {
        toast.success(
          `一口メモを${!trivia.isActive ? "有効" : "無効"}にしました`
        );
        fetchItems();
      } else {
        throw new Error("Failed to toggle trivia active status");
      }
    } catch (error) {
      console.error("Failed to toggle trivia active status:", error);
      toast.error("一口メモの状態変更に失敗しました");
    } finally {
      setTriviaLoading((prev) => ({ ...prev, [categoryItemId]: false }));
    }
  };

  const TriviaSection = memo(
    ({
      categoryItem,
      expandedTrivia,
      editingTrivia,
      triviaLoading,
      editingTriviaData,
      onToggleTriviaSection,
      onStartCreatingTrivia,
      onStartEditingTrivia,
      onCancelEditingTrivia,
      onSaveTrivia,
      onDeleteTrivia,
      onToggleTriviaActive,
    }: {
      categoryItem: CategoryItem;
      expandedTrivia: Record<string, boolean>;
      editingTrivia: Record<string, string | null>;
      triviaLoading: Record<string, boolean>;
      editingTriviaData: Record<
        string,
        {
          title?: string;
          content?: string;
          contentEn?: string | null;
          category?: string;
          tags?: string[];
          iconEmoji?: string | null;
          colorTheme?: string | null;
          isActive?: boolean;
        } | null
      >;
      onToggleTriviaSection: (categoryItemId: string) => void;
      onStartCreatingTrivia: (categoryItemId: string) => void;
      onStartEditingTrivia: (categoryItemId: string, triviaId: string) => void;
      onCancelEditingTrivia: (categoryItemId: string) => void;
      onSaveTrivia: (categoryItemId: string) => void;
      onDeleteTrivia: (categoryItemId: string, triviaId: string) => void;
      onToggleTriviaActive: (categoryItemId: string, triviaId: string) => void;
    }) => {
      const isExpanded = expandedTrivia[categoryItem.id] || false;
      const isEditing = editingTrivia[categoryItem.id] !== null;
      const activeTriviaCount = categoryItem.trivia.filter(
        (trivia) => trivia.isActive
      ).length;
      const totalTriviaCount = categoryItem.trivia.length;

      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onToggleTriviaSection(categoryItem.id)}
              className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
            >
              <span>一口メモ {totalTriviaCount}件</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            <Button
              onClick={() => onStartCreatingTrivia(categoryItem.id)}
              size="sm"
              className="text-xs h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-3 mt-3">
              {/* 編集フォーム */}
              {isEditing && (
                <TriviaEditForm
                  key={`trivia-edit-${categoryItem.id}`}
                  categoryItemId={categoryItem.id}
                  editingTriviaData={editingTriviaData[categoryItem.id]}
                  onSaveTrivia={onSaveTrivia}
                  onCancelEditingTrivia={onCancelEditingTrivia}
                  isLoading={triviaLoading[categoryItem.id]}
                  isEditing={editingTrivia[categoryItem.id] !== "new"}
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
                        onStartEditingTrivia={onStartEditingTrivia}
                        onDeleteTrivia={onDeleteTrivia}
                        onToggleTriviaActive={onToggleTriviaActive}
                        isLoading={triviaLoading[categoryItem.id]}
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
                              className="opacity-80"
                            >
                              <TriviaDisplay
                                categoryItemId={categoryItem.id}
                                trivia={trivia}
                                categoryItem={categoryItem}
                                onStartEditingTrivia={onStartEditingTrivia}
                                onDeleteTrivia={onDeleteTrivia}
                                onToggleTriviaActive={onToggleTriviaActive}
                                isLoading={triviaLoading[categoryItem.id]}
                              />
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  一口メモがありません
                </p>
              )}

              {/* 統計情報 */}
              {totalTriviaCount > 0 && (
                <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded mt-3">
                  <span>
                    合計{totalTriviaCount}件 (アクティブ: {activeTriviaCount}件,
                    非アクティブ: {totalTriviaCount - activeTriviaCount}件)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  );
  TriviaSection.displayName = "TriviaSection";

  const TriviaEditForm = memo(
    ({
      categoryItemId,
      editingTriviaData,
      onSaveTrivia,
      onCancelEditingTrivia,
      isLoading,
      isEditing,
    }: {
      categoryItemId: string;
      editingTriviaData: {
        title?: string;
        content?: string;
        contentEn?: string | null;
        category?: string;
        tags?: string[];
        iconEmoji?: string | null;
        colorTheme?: string | null;
        isActive?: boolean;
      } | null;
      onSaveTrivia: (
        categoryItemId: string,
        data?: {
          title?: string;
          content?: string;
          contentEn?: string | null;
          category?: string;
          tags?: string[];
          iconEmoji?: string | null;
          colorTheme?: string | null;
          isActive?: boolean;
        }
      ) => void;
      onCancelEditingTrivia: (categoryItemId: string) => void;
      isLoading: boolean;
      isEditing: boolean;
    }) => {
      // ローカル状態を使用
      const [localData, setLocalData] = useState({
        title: editingTriviaData?.title || "",
        content: editingTriviaData?.content || "",
        category: editingTriviaData?.category || "",
        tags: editingTriviaData?.tags || [],
        iconEmoji: editingTriviaData?.iconEmoji || "",
        colorTheme: editingTriviaData?.colorTheme || "",
        isActive: editingTriviaData?.isActive || false,
      });

      // 初期データが変更された場合のみローカル状態を更新
      useEffect(() => {
        setLocalData({
          title: editingTriviaData?.title || "",
          content: editingTriviaData?.content || "",
          category: editingTriviaData?.category || "",
          tags: editingTriviaData?.tags || [],
          iconEmoji: editingTriviaData?.iconEmoji || "",
          colorTheme: editingTriviaData?.colorTheme || "",
          isActive: editingTriviaData?.isActive || false,
        });
      }, [editingTriviaData]);

      const handleSave = () => {
        onSaveTrivia(categoryItemId, localData);
      };

      const handleCancel = () => {
        onCancelEditingTrivia(categoryItemId);
      };

      return (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">
                {isEditing ? "一口メモ編集" : "一口メモ新規作成"}
              </h4>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-3 w-3 mr-1" />
                  保存
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-3 w-3 mr-1" />
                  キャンセル
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`title-${categoryItemId}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  タイトル
                </label>
                <Input
                  id={`title-${categoryItemId}`}
                  value={localData.title}
                  onChange={(e) =>
                    setLocalData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="一口メモのタイトル"
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor={`content-${categoryItemId}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  内容
                </label>
                <textarea
                  id={`content-${categoryItemId}`}
                  value={localData.content}
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="一口メモの内容（マークダウン対応）"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm h-32 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`category-${categoryItemId}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    カテゴリ
                  </label>
                  <Input
                    id={`category-${categoryItemId}`}
                    value={localData.category}
                    onChange={(e) =>
                      setLocalData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="カテゴリ"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`iconEmoji-${categoryItemId}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    アイコン絵文字
                  </label>
                  <Input
                    id={`iconEmoji-${categoryItemId}`}
                    value={localData.iconEmoji}
                    onChange={(e) =>
                      setLocalData((prev) => ({
                        ...prev,
                        iconEmoji: e.target.value,
                      }))
                    }
                    placeholder="😊"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`tags-${categoryItemId}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    タグ（カンマ区切り）
                  </label>
                  <Input
                    id={`tags-${categoryItemId}`}
                    value={localData.tags.join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag);
                      setLocalData((prev) => ({ ...prev, tags }));
                    }}
                    placeholder="タグ1, タグ2"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`colorTheme-${categoryItemId}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    カラーテーマ
                  </label>
                  <Input
                    id={`colorTheme-${categoryItemId}`}
                    value={localData.colorTheme}
                    onChange={(e) =>
                      setLocalData((prev) => ({
                        ...prev,
                        colorTheme: e.target.value,
                      }))
                    }
                    placeholder="blue, green, red"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`active-${categoryItemId}`}
                  checked={localData.isActive}
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label
                  htmlFor={`active-${categoryItemId}`}
                  className="text-xs text-gray-700"
                >
                  アクティブ
                </label>
              </div>
            </div>
          </div>
        </div>
      );
    }
  );
  TriviaEditForm.displayName = "TriviaEditForm";

  const TriviaDisplay = memo(
    ({
      categoryItemId,
      trivia,
      categoryItem,
      onStartEditingTrivia,
      onDeleteTrivia,
      onToggleTriviaActive,
      isLoading,
    }: {
      categoryItemId: string;
      trivia: CategoryItemTrivia;
      categoryItem: CategoryItem;
      onStartEditingTrivia: (categoryItemId: string, triviaId: string) => void;
      onDeleteTrivia: (categoryItemId: string, triviaId: string) => void;
      onToggleTriviaActive: (categoryItemId: string, triviaId: string) => void;
      isLoading: boolean;
    }) => {
      const [showPreview, setShowPreview] = useState(false);

      return (
        <>
          <div
            className="bg-blue-50 border border-blue-200 rounded p-3 mb-2 cursor-pointer overflow-hidden"
            onClick={() => setShowPreview(true)}
          >
            {/* ヘッダー部分 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {trivia.iconEmoji && (
                  <span className="text-base flex-shrink-0">
                    {trivia.iconEmoji}
                  </span>
                )}
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {trivia.title}
                </h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                    trivia.isActive
                      ? "bg-green-100 text-green-800"
                      : categoryItem.trivia && categoryItem.trivia.length === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {trivia.isActive ? "アクティブ" : "非アクティブ"}
                </span>
                <span className="text-xs text-blue-600 ml-auto">
                  クリックして詳細表示
                </span>
              </div>
            </div>

            {/* コンテンツ部分 */}
            <div className="text-sm text-gray-700">
              <div className="prose prose-sm max-w-none overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    iframe: ({ src, ...props }) => (
                      <div className="relative w-full max-w-full overflow-hidden rounded-lg my-2">
                        <iframe
                          {...props}
                          src={src}
                          className="w-full max-w-full h-auto aspect-video rounded-lg"
                          style={{ maxWidth: "100%", width: "100%" }}
                        />
                      </div>
                    ),
                    img: ({ src, alt, ...props }) => (
                      <img
                        {...props}
                        src={src}
                        alt={alt}
                        className="w-full max-w-full h-auto rounded-lg"
                        style={{ maxWidth: "100%" }}
                      />
                    ),
                    div: ({ children, ...props }) => (
                      <div {...props} className="max-w-full overflow-hidden">
                        {children}
                      </div>
                    ),
                  }}
                >
                  {trivia.content || "内容がありません"}
                </ReactMarkdown>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">
              <span>カテゴリ: {trivia.category}</span>
              {trivia.tags && trivia.tags.length > 0 && (
                <span>タグ: {trivia.tags.join(", ")}</span>
              )}
              {trivia.colorTheme && (
                <span
                  className={`px-1 py-0.5 rounded text-white text-xs bg-${trivia.colorTheme}-500`}
                >
                  {trivia.colorTheme}
                </span>
              )}
            </div>
          </div>

          {/* プレビューモーダル */}
          {showPreview && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowPreview(false)}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trivia.title || "一口メモプレビュー"}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        onStartEditingTrivia(categoryItemId, trivia.id)
                      }
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      閉じる
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {trivia.iconEmoji && (
                      <span className="text-xl">{trivia.iconEmoji}</span>
                    )}
                    <span>カテゴリ: {trivia.category}</span>
                    {trivia.tags && trivia.tags.length > 0 && (
                      <span>タグ: {trivia.tags.join(", ")}</span>
                    )}
                    {trivia.colorTheme && (
                      <span
                        className={`px-2 py-1 rounded text-white text-xs bg-${trivia.colorTheme}-500`}
                      >
                        {trivia.colorTheme}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        trivia.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {trivia.isActive ? "アクティブ" : "非アクティブ"}
                    </span>
                  </div>

                  {/* コンテンツ */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">内容</h4>
                    <div className="prose prose-sm max-w-none overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          iframe: ({ src, ...props }) => (
                            <div className="relative w-full max-w-full overflow-hidden rounded-lg my-4">
                              <iframe
                                {...props}
                                src={src}
                                className="w-full max-w-full h-auto aspect-video rounded-lg"
                                style={{ maxWidth: "100%", width: "100%" }}
                              />
                            </div>
                          ),
                          img: ({ src, alt, ...props }) => (
                            <img
                              {...props}
                              src={src}
                              alt={alt}
                              className="w-full max-w-full h-auto rounded-lg my-4"
                              style={{ maxWidth: "100%" }}
                            />
                          ),
                          div: ({ children, ...props }) => (
                            <div
                              {...props}
                              className="max-w-full overflow-hidden"
                            >
                              {children}
                            </div>
                          ),
                        }}
                      >
                        {trivia.content || "内容がありません"}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      onClick={() =>
                        onToggleTriviaActive(categoryItemId, trivia.id)
                      }
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className={
                        trivia.isActive
                          ? "text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                          : "text-green-600 border-green-300 hover:bg-green-50"
                      }
                    >
                      <ToggleLeft className="h-4 w-4 mr-1" />
                      {trivia.isActive ? "無効にする" : "有効にする"}
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          confirm(
                            `一口メモ「${
                              trivia.title || "無題"
                            }」を削除しますか？`
                          )
                        ) {
                          onDeleteTrivia(categoryItemId, trivia.id);
                          setShowPreview(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
  );
  TriviaDisplay.displayName = "TriviaDisplay";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">カテゴリアイテム管理</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="カテゴリアイテムを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
            <label htmlFor="category-select" className="sr-only">
              Select category
            </label>

            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="relative overflow-hidden flex flex-col"
          >
            {/* 画像エリア */}
            <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center overflow-hidden relative">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[0].url}
                  alt={item.images[0].altText || item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">画像なし</div>
              )}
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">
                {item.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="outline">{item.category}</Badge>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.published ? "公開中" : "非公開"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {item.content.substring(0, 150)}...
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <Link href={`/admin/category-item/${item.slug}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                </Link>
              </div>

              {/* 一口メモセクション */}
              <div className="pt-4 border-t">
                <TriviaSection
                  categoryItem={item}
                  expandedTrivia={expandedTrivia}
                  editingTrivia={editingTrivia}
                  triviaLoading={triviaLoading}
                  editingTriviaData={editingTriviaData}
                  onToggleTriviaSection={toggleTriviaSection}
                  onStartCreatingTrivia={startCreatingTrivia}
                  onStartEditingTrivia={startEditingTrivia}
                  onCancelEditingTrivia={cancelEditingTrivia}
                  onSaveTrivia={saveTrivia}
                  onDeleteTrivia={deleteTrivia}
                  onToggleTriviaActive={toggleTriviaActive}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            カテゴリアイテムが見つかりませんでした
          </p>
        </div>
      )}
    </div>
  );
}