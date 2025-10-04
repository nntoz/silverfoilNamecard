/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // GLSL用ローダー追加
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source', // Webpack5の推奨: 文字列としてインポート
    });

    return config;
  },
};

module.exports = nextConfig;
