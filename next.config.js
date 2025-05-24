/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⭐ 画像最適化を完全無効化（クレジット消費0）
  images: {
    unoptimized: true, // 完全無効化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nprutgcfqaovdxlzjoaa.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // ⭐ コンパイラ最適化（無料）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // React最適化
    emotion: false,
    styledComponents: false,
  },
  
  // ⭐ 圧縮最適化（無料）
  compress: true,
  
  // ⭐ 出力最適化
  swcMinify: true, // SWCによる高速ミニファイ
  
  // ⭐ ヘッダー最適化（重要・無料）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // DNS プリフェッチ
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // セキュリティヘッダー
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // パフォーマンスヒント
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge'
          },
        ],
      },
      // ⭐ 静的アセットの積極的キャッシュ（修正版）
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1年間キャッシュ
          },
        ],
      },
      // ⭐ CSS/JSの長期キャッシュ
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ⭐ フォントファイルのキャッシュ（修正版）
      {
        source: '/:path*.woff',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.ttf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.otf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ⭐ APIのキャッシュ戦略
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1時間キャッシュ、1日stale
          },
        ],
      },
    ];
  },
  
  // ⭐ リダイレクト最適化
  async redirects() {
    return [
      // 必要に応じてリダイレクトルールを追加
    ];
  },
  
  // ⭐ リライト最適化
  async rewrites() {
    return [
      // 必要に応じてリライトルールを追加
    ];
  },
  
  // ⭐ Webpack最適化（無料）
  webpack: (config, { dev, isServer }) => {
    // 本番環境でのバンドル最適化
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            // React関連を分離
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      };
    }

    // ⭐ クライアントサイド専用の最適化
    if (!isServer) {
      // ブラウザ専用ライブラリの最適化
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // ⭐ サーバーサイド専用の最適化
    if (isServer) {
      // Node.js専用の最適化
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
      
      // サーバーサイドでの不要なポリフィル削除
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native': 'react-native-web',
      };
    }

    // SVG最適化（共通）
    if (!dev) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
    }

    return config;
  },
  
  // ⭐ 出力設定
  trailingSlash: false,
  poweredByHeader: false,
  
  // ⭐ TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ⭐ ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;