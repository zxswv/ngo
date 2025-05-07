// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["jsonwebtoken"],

  webpack(config, { dev }) {
    if (dev) {
      config.infrastructureLogging = {
        level: "log",
      };
    }
    return config;
  },
};

module.exports = nextConfig;
