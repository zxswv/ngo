/** @type {import('next').NextConfig} */
const nextConfig = {
  // 必要な設定をここに追加します
  experimental: {
    // Turbopackを有効にする場合
    // turboMode: true,
    turbo: false, //,
  },
};
module.exports = nextConfig;

module.exports = {
  webpack(config, { dev }) {
    if (dev) {
      config.infrastructureLogging = {
        level: "log",
      };
    }
    return config;
  },
};
