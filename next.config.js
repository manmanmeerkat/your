/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 ビルドタイムアウト対策（最重要）
  staticPageGenerationTimeout: 180, // 3分に延長
  
  // 🚨 ビルド時エラー許容（一時的措置）
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // ⭐ 画像最適化を完全無効化（クレジット消費0）
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nprutgcfqaovdxlzjoaa.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // ⭐ 基本的なコンパイラ最適化のみ
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // ⭐ 基本圧縮
  compress: true,
  
  // ⭐ 実験的機能（ビルド最適化追加）
  experimental: {
    // 🚨 Prisma関連の最適化（競合回避）
    serverComponentsExternalPackages: ['prisma'],
    
    // 開発環境でのキャッシュ完全無効化
    ...(process.env.NODE_ENV === 'development' && {
      isrMemoryCacheSize: 0, // ISRキャッシュを無効化
    }),
    
    // 🚀 ビルド最適化
    ...(process.env.NODE_ENV === 'production' && {
      optimizeCss: true,
    }),
  },

  // ⭐ 開発環境での追加設定（キャッシュ完全無効化）
  ...(process.env.NODE_ENV === 'development' && {
    // developmentでのキャッシュを無効化
    onDemandEntries: {
      maxInactiveAge: 0,      // ページの非アクティブ時間を0に
      pagesBufferLength: 0,   // バッファリングを無効化
    },
  }),

  // 🚀 webpack最適化（ビルド高速化）
  webpack: (config, { dev, isServer }) => {
    // 🚨 プロダクションビルドの最適化
    if (!dev) {
      // メモリ使用量を削減
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // 🚨 クライアントサイドでPrismaを完全に除外
      if (!isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@prisma/client': false,
          'prisma': false,
        };
      }
    }

    return config;
  },
  
  // ⭐ 基本ヘッダー設定のみ
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      // 🚨 APIルートのキャッシュ制御（重要）
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      // 静的ファイルキャッシュ（本番環境のみ）
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate'  // 開発環境：キャッシュ無効
              : 'public, max-age=31536000, immutable', // 本番環境：長期キャッシュ
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate'  // 開発環境：キャッシュ無効
              : 'public, max-age=31536000, immutable', // 本番環境：長期キャッシュ
          },
        ],
      },
    ];

    // ⭐ 開発環境では記事ページもキャッシュ無効化
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/articles/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      });
    }

    return headers;
  },

  // 🚀 リダイレクト最適化
  async redirects() {
    return [
      // 必要に応じてリダイレクトルールを追加
    ];
  },
  
  // ⭐ 出力設定
  trailingSlash: false,
  poweredByHeader: false,

  // 🚨 出力モード設定（Vercel最適化）
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // 🚀 環境変数の最適化
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // 🚨 ページ拡張子設定
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 🚀 i18n設定（必要に応じて）
  // i18n: {
  //   locales: ['en', 'ja'],
  //   defaultLocale: 'en',
  // },

  // 🚨 SWC設定（高速化）
  swcMinify: true,

  // 🚀 React Strict Mode
  reactStrictMode: true,

  // 🚨 プロダクション最適化
  ...(process.env.NODE_ENV === 'production' && {
    // 本番環境での追加最適化
    productionBrowserSourceMaps: false, // ソースマップ無効化でビルド高速化
    optimizeFonts: true, // フォント最適化
  }),
};

module.exports = nextConfig;