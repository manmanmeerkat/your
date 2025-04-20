// app/admin/page.tsx
"use client";

import { Suspense } from "react";
import AdminDashboardContent from "./AdminDashboardContent"; // 既存のコンポーネントを別名で

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
