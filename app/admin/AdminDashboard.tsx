// app/admin/AdminDashboardContent.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardContent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">管理者ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* メッセージ管理カード */}
        <div className="bg-slate-800/60 border border-gray-700 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-3">メッセージ管理</h2>
          <p className="text-gray-300 mb-4">
            お問い合わせフォームから送信されたメッセージを確認・管理します。
          </p>
          <Link href="/admin/messages">
            <Button className="w-full bg-rose-700 hover:bg-rose-800">
              メッセージ一覧を見る
            </Button>
          </Link>
        </div>

        {/* 記事管理カード */}
        <div className="bg-slate-800/60 border border-gray-700 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-3">記事管理</h2>
          <p className="text-gray-300 mb-4">
            サイト内の記事を作成・編集・公開・非公開にします。
          </p>
          <Link href="/admin/articles">
            <Button className="w-full">記事一覧を見る</Button>
          </Link>
        </div>

        {/* サイト設定カード */}
        <div className="bg-slate-800/60 border border-gray-700 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-3">サイト設定</h2>
          <p className="text-gray-300 mb-4">サイト全体の設定を管理します。</p>
          <Link href="/admin/settings">
            <Button className="w-full" variant="outline">
              設定を編集
            </Button>
          </Link>
        </div>
      </div>

      {/* 未読メッセージ通知 */}
      <div className="mt-8 p-4 bg-slate-700/50 border border-rose-500 rounded-lg">
        <Link
          href="/admin/messages?status=unread"
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              !
            </div>
            <p>未読のメッセージがあります。確認してください。</p>
          </div>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
            未読メッセージを確認
          </Button>
        </Link>
      </div>
    </div>
  );
}
