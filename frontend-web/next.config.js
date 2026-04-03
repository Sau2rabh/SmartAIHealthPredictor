/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},


  // Faster SCSS compilation on Windows — suppresses redundant warnings
  sassOptions: {
    quietDeps: true,
  },

  // Optimize production bundle (removes console logs)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Performance & Error silencing
  experimental: {
    // Faster compilation for large libraries
    optimizePackageImports: ["lucide-react", "framer-motion", "axios"],
    // Use worker threads for faster builds
    workerThreads: true,
  },

  // Suppress annoying Webpack Cache warnings in terminal
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

module.exports = withPWA(nextConfig);

