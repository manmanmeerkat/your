// app/test-performance/page.tsx
// 開発環境でのパフォーマンステスト用ページ

import { prisma } from "@/lib/prisma";

async function testQueries() {
  const results = [];

  // 1. ホームページクエリテスト
  console.log("🚀 ホームページクエリテスト開始");
  const start1 = Date.now();

  const latestArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      summary: true,
      createdAt: true,
      images: {
        where: { isFeatured: true },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });

  const time1 = Date.now() - start1;
  results.push({
    query: "ホームページ最新記事",
    time: time1,
    count: latestArticles.length,
  });

  // 2. カテゴリページクエリテスト
  console.log("🚀 カテゴリページクエリテスト開始");
  const start2 = Date.now();

  const categoryArticles = await prisma.article.findMany({
    where: {
      category: "mythology",
      published: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const time2 = Date.now() - start2;
  results.push({
    query: "カテゴリページ",
    time: time2,
    count: categoryArticles.length,
  });

  // 3. 検索クエリテスト
  const start3 = Date.now();

  const searchResults = await prisma.article.findMany({
    where: {
      published: true,
      title: {
        contains: "Japan",
      },
    },
    take: 10,
  });

  const time3 = Date.now() - start3;
  results.push({
    query: "タイトル検索",
    time: time3,
    count: searchResults.length,
  });

  return results;
}

export default async function PerformanceTestPage() {
  const results = await testQueries();
  const totalTime = results.reduce((sum, r) => sum + r.time, 0);

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-8">
        データベースパフォーマンステスト
      </h1>

      <div className="grid gap-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] p-6 rounded-lg border border-[#df7163]"
          >
            <h3 className="text-xl font-semibold mb-2">{result.query}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">実行時間: {result.time}ms</span>
              <span className="text-gray-300">取得件数: {result.count}件</span>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  result.time < 50
                    ? "bg-green-600"
                    : result.time < 100
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                {result.time < 50
                  ? "🚀 超高速"
                  : result.time < 100
                  ? "✅ 高速"
                  : "⚠️ 要改善"}
              </span>
            </div>
          </div>
        ))}

        <div className="bg-[#2d2d2d] p-6 rounded-lg border-2 border-[#df7163]">
          <h3 className="text-2xl font-bold mb-2">総合評価</h3>
          <div className="flex justify-between items-center">
            <span className="text-xl">総実行時間: {totalTime}ms</span>
            <span
              className={`px-4 py-2 rounded text-lg font-bold ${
                totalTime < 150
                  ? "bg-green-600"
                  : totalTime < 300
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            >
              {totalTime < 150
                ? "🎉 優秀！"
                : totalTime < 300
                ? "👍 良好"
                : "📈 要改善"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[#0a0a0a] rounded-lg">
        <h4 className="font-semibold mb-2">📊 インデックス効果の目安:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 50ms未満: インデックスが完全に効いている状態</li>
          <li>• 50-100ms: 良好な状態</li>
          <li>• 100ms以上: さらなる最適化が必要</li>
        </ul>
      </div>
    </div>
  );
}
