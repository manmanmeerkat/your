/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化の設定
  images: {
    // remotePatterns（domainsは非推奨のためこちらを使用）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nprutgcfqaovdxlzjoaa.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    // 最新の画像フォーマットを有効化
    formats: ['image/webp', 'image/avif'],
    // プレースホルダーの設定
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ⭐ 実験的機能（問題のある設定を削除）
  experimental: {
    // optimizeCss: true, // ← critters エラーの原因なので削除
    // サーバーコンポーネント最適化
    serverComponentsExternalPackages: [],
  },
  
  // コンパイラ設定
  compiler: {
    // console.logの除去（本番環境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // エラーと警告は残す
    } : false,
    // reactRemoveProperties: process.env.NODE_ENV === 'production', // ← 存在しないオプションなので削除
  },
  
  // 圧縮とキャッシュの最適化
  compress: true,
  
  // プリフェッチの設定（簡素化）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      // 静的アセットの長期キャッシュ
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // ⭐ バンドルサイズ分析（安全な方法に修正）
  webpack: async (config, { dev, isServer }) => {
    // 開発環境またはサーバーサイドではスキップ
    if (dev || isServer) return config;
    
    // 環境変数でのみ有効化
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // 出力設定（静的エクスポート用）
  trailingSlash: false,
  
  // ⭐ パフォーマンス監視（Next.js 14対応）
  onDemandEntries: {
    // ページがメモリに保持される時間
    maxInactiveAge: 25 * 1000,
    // 同時にメモリに保持されるページ数
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;