// app/admin/messages/page.tsx
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // シングルトンのPrismaクライアント

// Server Componentとして定義
export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  // クエリパラメータから status を取得
  const status = searchParams.status || "all";

  // Where 条件を構築
  let whereCondition: Prisma.ContactMessageWhereInput = {};
  if (status === "unread") {
    whereCondition = { status: "unread" };
  } else if (status === "read") {
    whereCondition = { status: "read" };
  }

  try {
    // データの取得
    const messages = await prisma.contactMessage.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <div className="container mx-auto py-8">
        {/* 戻るボタンを追加 */}
        <div className="mb-4">
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <span>←</span> 管理ダッシュボードに戻る
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">お問い合わせメッセージ</h1>

        {/* フィルタリングコントロール */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 text-sm items-center">
            <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
            <span>未読メッセージ</span>
            <div className="w-4 h-4 bg-gray-500 rounded-full ml-4"></div>
            <span>既読メッセージ</span>
          </div>

          <div className="flex ml-auto gap-2">
            <Link href="/admin/messages">
              <Button
                variant={status === "all" ? "default" : "outline"}
                size="sm"
                className={
                  status === "all" ? "bg-blue-600 hover:bg-blue-700" : ""
                }
              >
                すべて
              </Button>
            </Link>
            <Link href="/admin/messages?status=unread">
              <Button
                variant={status === "unread" ? "default" : "outline"}
                size="sm"
                className={
                  status === "unread" ? "bg-rose-600 hover:bg-rose-700" : ""
                }
              >
                未読のみ
              </Button>
            </Link>
            <Link href="/admin/messages?status=read">
              <Button
                variant={status === "read" ? "default" : "outline"}
                size="sm"
                className={
                  status === "read" ? "bg-gray-600 hover:bg-gray-700" : ""
                }
              >
                既読のみ
              </Button>
            </Link>
          </div>
        </div>

        {messages.length === 0 ? (
          <p className="text-center py-10 text-gray-400">
            {status === "unread"
              ? "未読メッセージはありません。"
              : status === "read"
              ? "既読メッセージはありません。"
              : "メッセージはまだありません。"}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`relative border rounded-lg shadow-md p-6 transition-all duration-200 ${
                  msg.status === "unread"
                    ? "bg-slate-700/90 border border-rose-500"
                    : "bg-slate-800/70 border-gray-700"
                }`}
              >
                {/* ステータスインジケーター */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    msg.status === "unread" ? "bg-rose-500" : "bg-gray-500"
                  }`}
                ></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{msg.subject}</h3>
                      {msg.status === "unread" && (
                        <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          未読
                        </span>
                      )}
                      {msg.status === "read" && (
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                          既読
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      <span className="font-medium">{msg.name}</span> さんより (
                      {msg.email})
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <Link href={`/admin/messages/${msg.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        msg.status === "unread"
                          ? "border-rose-500 hover:bg-rose-600 hover:border-rose-600"
                          : "border-gray-500 hover:bg-gray-600 hover:border-gray-600"
                      } hover:text-white transition-colors`}
                    >
                      詳細を見る
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-gray-300 line-clamp-2 text-sm">
                    {msg.message}
                  </p>
                </div>

                {/* 未読/既読アイコン */}
                <div className="absolute top-6 right-6">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      msg.status === "unread" ? "bg-rose-500" : "bg-gray-500"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <span>←</span> 管理ダッシュボードに戻る
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">お問い合わせメッセージ</h1>

        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>
            メッセージの読み込み中にエラーが発生しました。しばらくしてからお試しください。
          </p>
        </div>
      </div>
    );
  }
}
