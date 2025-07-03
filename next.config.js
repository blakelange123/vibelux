/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@clerk/nextjs'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Optimize for build speed
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Optimize build
  swcMinify: true,
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    // Skip heavy modules during build
    if (!dev) {
      config.module.rules.push({
        test: /node_modules\/@tensorflow/,
        use: 'null-loader',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig