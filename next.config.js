/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
  // ⭐ 基本ヘッダー設定のみ
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      // 静的ファイルキャッシュ
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // ⭐ 出力設定
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig;