import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

const siteUrl = 'https://www.yoursecretjapan.com';

async function generateArticleSitemap() {
  // /articles ページ用の記事取得
  const articles = await prisma.article.findMany({
    select: { slug: true, updatedAt: true },
    where: { published: true },
  });

  // /category-item ページ用の記事取得
  const categoryItems = await prisma.categoryItem.findMany({
    select: { slug: true, updatedAt: true },
    where: { published: true },
  });

  // /articles URL生成
  const articleUrls = articles.map((article) => `
  <url>
    <loc>${siteUrl}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);

  // /category-item URL生成
  const categoryItemUrls = categoryItems.map((item) => `
  <url>
    <loc>${siteUrl}/category-item/${item.slug}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

  // sitemap 出力
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...articleUrls, ...categoryItemUrls].join('\n')}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap-articles.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');

  await prisma.$disconnect();
  console.log('✅ sitemap-articles.xml created (with /articles and /category-item)');
}

generateArticleSitemap();
