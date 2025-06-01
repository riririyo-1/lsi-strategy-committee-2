/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // JSONモジュールをインポート可能にする
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      use: "json-loader",
      type: "javascript/auto",
    });
    return config;
  },
  // 画像ドメインの設定
  images: {
    domains: ["placehold.co", "images.unsplash.com"], // 必要なドメインを許可
  },
};

module.exports = nextConfig;
