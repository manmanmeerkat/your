// next.config.js

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
  // 他の設定があればそのまま残してください
}

module.exports = nextConfig