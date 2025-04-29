// app/admin/messages/[id]/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ToggleStatus from "./toggle-status";
import DeleteButton from "./delete-button";
import { prisma } from "@/lib/prisma";

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return (
        <div className="container mx-auto py-8 text-center">
          メッセージが見つかりませんでした
        </div>
      );
    }

    // 未読メッセージを表示したら自動的に既読にする
    if (message.status === "unread") {
      await prisma.contactMessage.update({
        where: { id: params.id },
        data: { status: "read" },
      });
    }

    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/admin/messages">
            <Button variant="outline">← メッセージ一覧に戻る</Button>
          </Link>
          <div className="flex gap-3">
            <DeleteButton id={message.id} />
            <ToggleStatus id={message.id} initialStatus={message.status} />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-gray-700 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{message.subject}</h1>
            <p className="text-gray-300 mt-2">
              <span className="font-medium">{message.name}</span> さんより (
              {message.email})
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(message.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <p className="whitespace-pre-wrap text-gray-200">
              {message.message}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4">
              {message.name} さんに返信する
            </h2>
            <Link
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
            >
              <Button className="bg-rose-700 hover:bg-rose-800">
                メールで返信する
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching message:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/admin/messages">
            <Button variant="outline">← メッセージ一覧に戻る</Button>
          </Link>
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>
            メッセージの読み込み中にエラーが発生しました。しばらくしてからお試しください。
          </p>
        </div>
      </div>
    );
  }
}
