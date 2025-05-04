"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  published: boolean;
  createdAt: string;
  images?: {
    url: string;
    altText?: string;
    isFeatured?: boolean;
  }[];
}

const categoryLabels = {
  "about-japanese-gods": "日本の神々",
  "japanese-culture-category": "日本文化",
  "seasonal-festivals": "季節の祭り",
  "japanese-way-of-life": "日本の生活様式",
};

export default function CategoryItemsPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategoryItems();
  }, [selectedCategory, searchQuery]);

  const fetchCategoryItems = async () => {
    try {
      setLoading(true);

      // クエリパラメータを構築
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/category-items?${params.toString()}`);

      if (!response.ok) throw new Error("データの取得に失敗しました");

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching category items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">カテゴリ項目管理</h2>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">記事管理に戻る</Button>
          </Link>
          <Link href="/admin/category-item/new">
            <Button>新規カテゴリ項目作成</Button>
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* カテゴリー選択 */}
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリー</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">すべてのカテゴリー</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 検索 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              タイトル検索
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="項目タイトルで検索..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 一覧表示 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded shadow">
                <div className="p-4">
                  {/* 画像 */}
                  <div className="w-full h-32 relative mb-3">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0].url}
                        alt={item.images[0].altText || item.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <p className="text-gray-500">画像なし</p>
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {categoryLabels[
                      item.category as keyof typeof categoryLabels
                    ] || item.category}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-sm ${
                        item.published ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {item.published ? "公開中" : "下書き"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 編集ボタン */}
                  <Link href={`/admin/category-item/${item.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      編集
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center py-12">
              カテゴリ項目がありません。
              {selectedCategory &&
                ` カテゴリー「${
                  categoryLabels[
                    selectedCategory as keyof typeof categoryLabels
                  ]
                }」には`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
