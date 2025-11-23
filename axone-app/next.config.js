/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Temporairement désactiver ESLint pendant le build pour permettre la correction progressive
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Garder la vérification TypeScript active
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": path.resolve(__dirname, "src/shims/async-storage.ts"),
    };
    return config;
  },
};

module.exports = nextConfig;


