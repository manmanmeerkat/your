// scripts/test-prisma.mts
import { prisma } from '../lib/prisma.ts';

async function main() {
  // ここにテストしたいPrismaのクエリを記述します
  try {
    console.log("Prisma Clientのテストを開始します...");

    const article = await prisma.article.findFirst({
      where: {
        slug: 'shikigami',
      },
    });

    if (article) {
      console.log("記事が見つかりました:", article);
    } else {
      console.log("記事 'shikigami' は見つかりませんでした。");
      const allArticles = await prisma.article.findMany({
        select: {
          slug: true,
          title: true,
          published: true,
        },
      });
      console.log("存在する記事のスラグ:", allArticles.map(a => ({slug: a.slug, published: a.published})));
    }

    console.log("テストが正常に完了しました。");
  } catch (e) {
    console.error("テスト中にエラーが発生しました:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();