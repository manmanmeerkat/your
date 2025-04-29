// app/admin/messages/[id]/toggle-status.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ToggleStatus({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    setIsLoading(true);
    const newStatus = status === "read" ? "unread" : "read";

    try {
      const response = await fetch(`/api/contact/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={status === "read" ? "outline" : "default"}
      onClick={toggleStatus}
      disabled={isLoading}
      className={
        status === "read"
          ? "border-gray-500 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
          : "bg-blue-600 hover:bg-blue-700"
      }
    >
      {isLoading
        ? "更新中..."
        : status === "read"
        ? "未読にする"
        : "既読にする"}
    </Button>
  );
}
