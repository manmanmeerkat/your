// app/admin/messages/[id]/delete-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 削除成功したらメッセージ一覧ページにリダイレクト
        router.push("/admin/messages");
        router.refresh();
      } else {
        alert("メッセージの削除に失敗しました。");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("メッセージの削除中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="flex gap-2">
        <p className="mr-2 text-sm text-red-500">本当に削除しますか？</p>
        <Button
          variant="default"
          size="sm"
          onClick={confirmDelete}
          disabled={isLoading}
        >
          {isLoading ? "削除中..." : "削除する"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={cancelDelete}
          disabled={isLoading}
        >
          キャンセル
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-500"
      onClick={handleDeleteClick}
    >
      メッセージを削除
    </Button>
  );
}
