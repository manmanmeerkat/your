/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.yoursecretjapan.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/admin/**',
    '/api/**',
    '/drafts/**',
  ],
  sitemapSize: 5000,
  transform: async (config, path) => {
    if (path.startsWith('/articles/')) return null;

    return {
      loc: `${config.siteUrl}${path}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const staticCategoryPaths = [
      '/mythology',
      '/culture',
      '/customs',
      '/festivals',
      '/all-articles',
    ];

    return staticCategoryPaths.map((path) => ({
      loc: `${config.siteUrl}${path}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }));
  },
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.yoursecretjapan.com/sitemap-articles.xml',
    ],
  },
};