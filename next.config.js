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
  webpack(config, { dev }) {
    if (!dev) {
      // 本番ビルドの場合、importを使ってTerserPluginをインポート
      import('terser-webpack-plugin').then(TerserPlugin => {
        config.optimization.minimizer.push(
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // console.log などを削除
              },
            },
          })
        );

        return config;
      });
    } else {
      return config;
    }
  },
  // 他の設定があればそのまま残してください
}

module.exports = nextConfig;
