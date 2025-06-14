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
  
  // ⭐ 実験的機能（最小限に簡素化）
  experimental: {
    // 🚨 Prisma関連の最適化のみ
    serverComponentsExternalPackages: ['prisma'],
    
    // 開発環境でのキャッシュ完全無効化
    ...(process.env.NODE_ENV === 'development' && {
      isrMemoryCacheSize: 0,
    }),
  },

  // ⭐ 開発環境での追加設定（キャッシュ完全無効化）
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 0,
      pagesBufferLength: 0,
    },
  }),

  // 🚀 webpack設定を最小限に簡素化
  webpack: (config, { isServer }) => {
    // 🚨 サーバーサイドでのPrisma最適化のみ
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
        'prisma': false,
      };
    }

    // 🚨 Node.js polyfillsを無効化（クライアントサイドのみ）
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
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
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
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
  
  // ⭐ 出力設定
  trailingSlash: false,
  poweredByHeader: false,

  // 🚨 React設定
  reactStrictMode: true,

  // 🚨 SWC設定
  swcMinify: true,
};

module.exports = nextConfig;