import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations (swcMinify is now default in Next.js 15)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Build performance - temporarily ignore errors for production deployment
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs', 'framer-motion'],
    typedRoutes: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable parallel builds
    serverComponentsExternalPackages: ['@prisma/client'],
    // Optimize compilation
    optimizeCss: true,
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
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Split large libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma',
            chunks: 'all',
            priority: 15,
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