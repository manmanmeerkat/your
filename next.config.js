/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'nprutgcfqaovdxlzjoaa.supabase.co', // Supabaseのストレージドメイン
      // 必要に応じて他のドメインも追加できます
    ],
    formats: ['image/webp', 'image/avif'], // 最適な画像フォーマット
  },
  experimental: {
    // 特定のページをプリレンダリングから除外
    excludePages: ['/admin/**', '/all-articles', '/404', '/500'],
    // optimizeCss: trueを削除 - critters関連のエラーを回避
  },
  compiler: {
    removeConsole: {
      exclude: ['error'], // console.errorだけは残す
    },
  },
  // SWCの設定調整
  swcMinify: true,
  // 各種タイムアウト設定
  staticPageGenerationTimeout: 120,
  // 厳格モードを有効化
  reactStrictMode: true,
};

module.exports = nextConfig;