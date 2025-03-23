/** @type {import('next').NextConfig} */
const nextConfig = {
    // experimental: {
    //   turbopack: true,          //Turbopackを有効にする設定
    // },
    reactStrictMode: true,      // ついでに Strict Mode を設定（必須ではないです）
    webpack: (config) => {      // ↓ここ以降を追加
      config.watchOptions = {   //
        poll: 1000,             //
        aggregateTimeout: 300   //
      }                         //
      return config;            //
    }                           // ↑ここまで
};

export default nextConfig;

