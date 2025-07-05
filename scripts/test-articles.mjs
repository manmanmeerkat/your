import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testArticles() {
  try {
    console.log('=== 記事データ確認 ===');
    
    // 全記事を取得
    const allArticles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        category: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`総記事数: ${allArticles.length}`);
    console.log('\n=== 全記事一覧 ===');
    allArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Published: ${article.published}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Created: ${article.createdAt}`);
      console.log('');
    });
    
    // 公開済み記事のみ
    const publishedArticles = allArticles.filter(article => article.published);
    console.log(`\n=== 公開済み記事数: ${publishedArticles.length} ===`);
    publishedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.slug})`);
    });
    
    // 未公開記事のみ
    const unpublishedArticles = allArticles.filter(article => !article.published);
    console.log(`\n=== 未公開記事数: ${unpublishedArticles.length} ===`);
    unpublishedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.slug})`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testArticles(); 