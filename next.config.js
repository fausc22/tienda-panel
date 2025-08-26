/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ['@heroui/react', '@heroicons/react']
  },
  
  // Configuración para subdirectorio en producción
  ...(isProd && {
    basePath: '/panel',
    assetPrefix: '/panel',
  }),
  
  // Configurar imágenes para export estático
  images: {
    unoptimized: true,
  },
  
  // Configurar redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/inicio',
        permanent: false,
      },
    ];
  },
  
  // Configurar headers para archivos estáticos
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;