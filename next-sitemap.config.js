/* eslint-disable @typescript-eslint/no-require-imports */
const { prisma } = require('./lib/prisma');

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.yoursecretjapan.com',
  generateRobotsTxt: true,
  exclude: ['/admin/**', '/api/**', '/drafts/**'],
  sitemapSize: 5000,
  additionalPaths: async () => {
    const articles = await prisma.article.findMany({
      select: { slug: true, updatedAt: true },
      where: { published: true },
    });

    const staticPaths = [
      { loc: '/', changefreq: 'daily', priority: 0.7 },
      { loc: '/mythology', changefreq: 'daily', priority: 0.7 },
      { loc: '/culture', changefreq: 'daily', priority: 0.7 },
      { loc: '/customs', changefreq: 'daily', priority: 0.7 },
      { loc: '/festivals', changefreq: 'daily', priority: 0.7 },
      { loc: '/about', changefreq: 'daily', priority: 0.7 },
      { loc: '/contact', changefreq: 'daily', priority: 0.7 },
      { loc: '/all-articles', changefreq: 'daily', priority: 0.7 },
      { loc: '/privacy-policy', changefreq: 'daily', priority: 0.7 },
    ];

    const articlePaths = articles.map((article) => ({
      loc: `/articles/${article.slug}`,
      lastmod: article.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    }));

    return [...staticPaths, ...articlePaths];
  },
};

module.exports = config;
