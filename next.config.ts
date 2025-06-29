import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations (swcMinify is now default in Next.js 15)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Build performance
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs', 'framer-motion'],
    typedRoutes: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  webpack: (config, { isServer, dev }) => {
    // Performance optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    if (!isServer) {
      // Exclude Node.js only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        serialport: false,
      };
      
      // Exclude modbus-serial and related modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'modbus-serial': 'commonjs modbus-serial',
        'serialport': 'commonjs serialport',
      });
    }
    
    return config;
  },
};

export default nextConfig;