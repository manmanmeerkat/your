// components/loaders/ArticlesLoader.tsx
type ArticlesLoaderProps = {
  fullPage?: boolean;
};

export default function ArticlesLoader({
  fullPage = false,
}: ArticlesLoaderProps) {
  if (fullPage) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-12 text-white">Latest Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 3つのスケルトンカードを表示 */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
          >
            {/* サムネイルプレースホルダー */}
            <div className="h-48 bg-slate-700"></div>
            {/* コンテンツプレースホルダー */}
            <div className="p-4">
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
