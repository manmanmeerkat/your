/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 ビルドタイムアウト対策のみ
  staticPageGenerationTimeout: 180,
  
  // 🚨 エラー許容
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🚨 画像最適化無効化
  images: {
    unoptimized: true,
  },
  
  // 🚨 最小限のPrisma設定のみ
  experimental: {
    serverComponentsExternalPackages: ['prisma'],
  },

  // 🚨 最小限のwebpack設定
  webpack: (config, { isServer }) => {
    // クライアントサイドでPrismaを除外するのみ
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;