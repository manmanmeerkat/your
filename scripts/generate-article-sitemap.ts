import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

const siteUrl = 'https://www.yoursecretjapan.com';

async function generateArticleSitemap() {
  const articles = await prisma.article.findMany({
    select: { slug: true, updatedAt: true },
    where: { published: true },
  });

  const urls = articles.map((article) => `
  <url>
    <loc>${siteUrl}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap-articles.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');

  await prisma.$disconnect();
  console.log('✅ sitemap-articles.xml created');
}

generateArticleSitemap();