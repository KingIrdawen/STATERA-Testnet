import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
      '@react-native-async-storage/async-storage': require.resolve('./src/shims/async-storage.ts'),
    };
    return config;
  },
};

export default nextConfig;
