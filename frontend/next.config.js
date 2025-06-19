/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Turbopackでも動作するようにwebpack設定を条件付きに
  webpack: (config, { isServer }) => {
    if (!config.experiments) {
      config.experiments = {};
    }
    
    config.module.rules.push({
      test: /\.json$/,
      use: "json-loader",
      type: "javascript/auto",
    });
    return config;
  },
  // 画像ドメインの設定
  images: {
    remotePatterns: [
      // 基本プレースホルダー
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // RSS記事の画像ドメイン
      {
        protocol: 'https',
        hostname: 'www3.nhk.or.jp',
      },
      {
        protocol: 'https',
        hostname: 'image.itmedia.co.jp',
      },
      {
        protocol: 'https',
        hostname: 'eetimes.itmedia.co.jp',
      },
      {
        protocol: 'https',
        hostname: 'news.mynavi.jp',
      },
      {
        protocol: 'https',
        hostname: 'xtech.nikkei.com',
      },
      {
        protocol: 'https',
        hostname: 'gigazine.net',
      },
      {
        protocol: 'https',
        hostname: 'wired.jp',
      },
      {
        protocol: 'https',
        hostname: 'scienceportal.jst.go.jp',
      },
      // 海外メディア
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
      },
      {
        protocol: 'https',
        hostname: 'www.wired.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theverge.com',
      },
      {
        protocol: 'https',
        hostname: 'arstechnica.com',
      },
      {
        protocol: 'https',
        hostname: 'www.engadget.com',
      },
      {
        protocol: 'https',
        hostname: 'www.technologyreview.com',
      },
      {
        protocol: 'https',
        hostname: 'semiconductor-today.com',
      },
      // 金融・ビジネス
      {
        protocol: 'https',
        hostname: 'assets.wor.jp',
      },
      {
        protocol: 'https',
        hostname: 'feeds.bloomberg.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.bwbx.io',
      },
      {
        protocol: 'https',
        hostname: 'www.ft.com',
      },
      {
        protocol: 'https',
        hostname: 'www.forbes.com',
      },
      {
        protocol: 'https',
        hostname: 'www.forbesjapan.com',
      },
      {
        protocol: 'https',
        hostname: 'fortune.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theinformation.com',
      },
      // 主要報道機関
      {
        protocol: 'https',
        hostname: 'rss.nytimes.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theguardian.com',
      },
      {
        protocol: 'https',
        hostname: 'feeds.bbci.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'www.cnbc.com',
      },
      {
        protocol: 'https',
        hostname: 'feeds.npr.org',
      },
      {
        protocol: 'https',
        hostname: 'www.cbsnews.com',
      },
      // その他の一般的な画像ホスト
      {
        protocol: 'https',
        hostname: 'image.news.livedoor.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-ak.f.st-hatena.com',
      },
      {
        protocol: 'https',
        hostname: 'ogp.me',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      // CDN や画像サービス
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '*.bwbx.io',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
      },
      {
        protocol: 'https',
        hostname: '*.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: '*.medium.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
