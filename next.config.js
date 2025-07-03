/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ignore heavy files that might cause timeouts
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.git', '**/temp-disabled', '**/temp_disabled', '**/docs', '**/*.md', '**/*.log']
    };
    
    return config;
  }
}

module.exports = nextConfig