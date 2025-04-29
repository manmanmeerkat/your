/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'nprutgcfqaovdxlzjoaa.supabase.co', // Supabaseのストレージドメイン
      // 必要に応じて他のドメインも追加できます
    ],
    formats: ['image/webp', 'image/avif'], // 最適な画像フォーマットを使用
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // レスポンシブな画像サイズ
  },
  experimental: {
    // 特定のページをプリレンダリングから除外
    excludePages: ['/admin/**', '/all-articles'],
    optimizeCss: true, // CSS最適化
    scrollRestoration: true, // スクロール位置の復元
  },
  compiler: {
    removeConsole: {
      exclude: ['error'], // console.errorだけは残す
    },
  },
  // キャッシュ設定を追加
  staticPageGenerationTimeout: 120, // 静的ページ生成タイムアウトを延長（秒単位）
  reactStrictMode: true,
  swcMinify: true, // SWCを使用した高速なminify
};

module.exports = nextConfig;