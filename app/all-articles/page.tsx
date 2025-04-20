// app/all-articles/page.tsx (新しく作成)
import { Suspense } from "react";
import AllArticlesContent from "./AllArticlesContent";

export default function AllArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      }
    >
      <AllArticlesContent />
    </Suspense>
  );
}
