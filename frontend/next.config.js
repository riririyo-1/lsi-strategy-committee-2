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
    domains: [
      "placehold.co", 
      "images.unsplash.com",
      // RSS記事の画像ドメイン
      "www3.nhk.or.jp",
      "image.itmedia.co.jp",
      "eetimes.itmedia.co.jp",
      "news.mynavi.jp",
      "image.news.livedoor.com",
      "cdn-ak.f.st-hatena.com",
      "ogp.me",
      "graph.facebook.com"
    ],
  },
};

module.exports = nextConfig;
