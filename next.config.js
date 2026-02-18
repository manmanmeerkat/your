/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⭐ 画像最適化を完全無効化（クレジット消費0）
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nprutgcfqaovdxlzjoaa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Supabase Storage用の設定を追加
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
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
  
  // ⭐ 実験的機能（開発環境でのキャッシュ無効化追加）
  experimental: {
    // 開発環境でのキャッシュ完全無効化
    ...(process.env.NODE_ENV === 'development' && {
      isrMemoryCacheSize: 0, // ISRキャッシュを無効化
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
  
  // ⭐ 出力設定
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig;