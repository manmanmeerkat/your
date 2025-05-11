/* eslint-disable @typescript-eslint/no-require-imports */
import { writeFileSync } from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { Article } from '@prisma/client'; // ← Prismaの型をインポート

const domain = 'https://www.yoursecretjapan.com';

(async () => {
  const articles: Pick<Article, 'slug' | 'updatedAt'>[] = await prisma.article.findMany({
    select: { slug: true, updatedAt: true },
    where: { published: true },
  });

  const urls = articles
    .map((article) => {
      return `
  <url>
    <loc>${domain}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap-articles.xml');
  writeFileSync(outputPath, sitemap);
  console.log('✅ sitemap-articles.xml generated at:', outputPath);
  process.exit();
})();