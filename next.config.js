/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // <-- agregá esta línea para export estático
  experimental: {
    optimizePackageImports: ['@heroui/react', '@heroicons/react']
  }
};

module.exports = nextConfig;
