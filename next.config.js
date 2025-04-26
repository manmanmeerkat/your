/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'nprutgcfqaovdxlzjoaa.supabase.co', // Supabaseのストレージドメイン
      // 必要に応じて他のドメインも追加できます
    ],
  },
  experimental: {
    // 特定のページをプリレンダリングから除外
    excludePages: ['/admin/**', '/all-articles'],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'], // console.errorだけは残す
    },
  },
};

module.exports = nextConfig;
