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
  webpack: (config, { isServer }) => {
    // Alias pour shim @react-native-async-storage/async-storage en environnement web
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@react-native-async-storage/async-storage': path.resolve(
          __dirname,
          'src/shims/async-storage.ts'
        ),
      };
    }
    return config;
  },
};

export default nextConfig;
