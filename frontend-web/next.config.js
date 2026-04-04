/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,


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
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

module.exports = withPWA(nextConfig);

