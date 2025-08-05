import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set custom output directory to 'dist'
  distDir: 'dist',
  
  // Disable server-side features that don't work with static export
  trailingSlash: true,
  
  // Optional: Add base path if deploying to a subdirectory
  // basePath: '/your-app-name',
  
  // Optional: Add asset prefix for CDN deployment
  // assetPrefix: 'https://your-cdn.com',
  
  // Environment variables for static export
  env: {
    NEXT_PUBLIC_CEDAR_CHATBOT_API: process.env.NEXT_PUBLIC_CEDAR_CHATBOT_API || 'https://chatbot.collectco.com/cedarbot/api/',
  },
  
  // Enable experimental features for Next.js 15
  experimental: {
    // Enable React 19 features if you're using React 19
    // reactCompiler: true,
  },
  
  // Webpack configuration for additional optimizations
  webpack: (config, { isServer }) => {
    // Additional webpack optimizations can go here
    return config;
  },
};

export default nextConfig;