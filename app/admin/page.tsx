"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    pageCount: 1,
    total: 0,
  });
  const supabase = createClientComponentClient();

  // ページを変更する関数
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // セッションチェックと記事データ取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          console.log("セッションなし - ログインページへリダイレクト");
          window.location.href = "/admin/login";
          return false;
        }

        return true;
      } catch (error) {
        console.error("認証チェックエラー:", error);
        setError("認証エラーが発生しました。");
        setLoading(false);
        return false;
      }
    };

    const fetchArticles = async () => {
      try {
        const apiUrl = `/api/articles?page=${pagination.page}&pageSize=${pagination.pageSize}&includeImages=true`;
        console.log("記事取得API呼び出し:", apiUrl);

        const response = await fetch(apiUrl, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`API エラー: ${response.status}`);
        }

        const data = await response.json();
        console.log("記事データ取得成功:", data);

        if (data.articles) {
          setArticles(data.articles);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          console.warn("記事データが空です");
          setArticles([]);
        }
      } catch (error) {
        console.error("記事の取得に失敗しました:", error);
        setError(
          "記事の読み込みに失敗しました。ページを再読み込みするか、管理者に連絡してください。"
        );
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchArticles();
      }
    };

    initialize();
  }, [pagination.page, pagination.pageSize, supabase]);

  // 記事の特集画像を取得するヘルパー関数
  const getFeaturedImage = (article: any) => {
    if (article.images && article.images.length > 0) {
      // 特集画像（isFeatured=true）を優先
      const featuredImage = article.images.find((img: any) => img.isFeatured);
      if (featuredImage) return featuredImage;

      // 特集画像がなければ最初の画像を使用
      return article.images[0];
    }
    return null;
  };

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`;
  };

  // HTML本文からプレーンテキストを抽出
  const getPlainTextFromHtml = (html: string) => {
    if (!html) return "";
    // HTMLタグを除去して純粋なテキストだけを取得
    return html.replace(/<[^>]*>/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">記事管理</h2>
        <Link href="/admin/articles/new">
          <Button>新規記事作成</Button>
        </Link>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles && articles.length > 0 ? (
              articles.map((article: any) => {
                const featuredImage = getFeaturedImage(article);
                const plainContent = getPlainTextFromHtml(article.content);
                const excerptContent =
                  plainContent.length > 100
                    ? `${plainContent.substring(0, 100)}...`
                    : plainContent;

                return (
                  <div key={article.id} className="bg-gray-50 rounded shadow">
                    <div className="flex p-4">
                      {/* 画像コンテナ - 左側 */}
                      <div className="flex-shrink-0 w-32 h-32 relative mr-4">
                        {featuredImage ? (
                          <Image
                            src={featuredImage.url}
                            alt={featuredImage.altText || article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">画像なし</p>
                          </div>
                        )}
                      </div>

                      {/* 記事情報 - 右側 */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-1">
                          {article.title}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(article.createdAt)}
                        </div>

                        {/* 記事本文の抜粋 */}
                        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                          {article.summary || excerptContent}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm">
                            {article.category && (
                              <span className="font-medium">
                                {article.category}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span
                              className={
                                article.published
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }
                            >
                              {article.published ? "公開中" : "下書き"}
                            </span>
                          </div>
                        </div>

                        <Link href={`/admin/articles/${article.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm py-1"
                          >
                            記事を編集
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center py-12 text-base">
                記事がありません。新しい記事を作成してください。
              </p>
            )}
          </div>

          {/* ページネーション UI */}
          {pagination.pageCount > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pagination.page === 1}
              >
                最初
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                前へ
              </Button>

              <div className="px-4">
                <span className="font-medium">{pagination.page}</span>
                <span className="text-slate-500">
                  {" "}
                  / {pagination.pageCount}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pageCount}
              >
                次へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.pageCount)}
                disabled={pagination.page === pagination.pageCount}
              >
                最後
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
