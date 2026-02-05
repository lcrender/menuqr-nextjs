/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================
  // CONFIGURACIÓN BASE
  // ========================================
  reactStrictMode: true,
  swcMinify: true,
  
  // ========================================
  // CONFIGURACIÓN DE IMÁGENES
  // ========================================
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      // Agregar dominios de producción aquí
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ========================================
  // CONFIGURACIÓN DE ENTORNOS
  // ========================================
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
  },

  // ========================================
  // CONFIGURACIÓN DE HEADERS
  // ========================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // ========================================
  // CONFIGURACIÓN DE REDIRECCIONES
  // ========================================
  async redirects() {
    return [
      // Redirección removida: la landing page se muestra en /
      // {
      //   source: '/',
      //   destination: '/admin',
      //   permanent: false,
      // },
    ];
  },

  // ========================================
  // CONFIGURACIÓN DE REWRITES
  // ========================================
  async rewrites() {
    return [
      {
        source: '/r/:restaurantSlug',
        destination: '/restaurant/:restaurantSlug',
      },
      {
        source: '/m/:menuSlug',
        destination: '/menu/:menuSlug',
      },
    ];
  },

  // ========================================
  // CONFIGURACIÓN DE EXPERIMENTALES
  // ========================================
  experimental: {
    // Habilitar App Router en el futuro
    // appDir: true,
    
    // Optimizaciones de rendimiento
    optimizeCss: true,
    scrollRestoration: true,
  },

  // ========================================
  // CONFIGURACIÓN DE WEBPACK
  // ========================================
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.runtimeChunk = 'single';
    }

    // Configuración para archivos estáticos
    config.module.rules.push({
      test: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/files/',
            outputPath: 'static/files/',
          },
        },
      ],
    });

    return config;
  },

  // ========================================
  // CONFIGURACIÓN DE TYPESCRIPT
  // ========================================
  typescript: {
    // Ignorar errores de TypeScript durante el build
    ignoreBuildErrors: false,
  },

  // ========================================
  // CONFIGURACIÓN DE ESLINT
  // ========================================
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: false,
  },

  // ========================================
  // CONFIGURACIÓN DE OUTPUT
  // ========================================
  output: 'standalone',

  // ========================================
  // CONFIGURACIÓN DE TRAILING SLASH
  // ========================================
  trailingSlash: false,

  // ========================================
  // CONFIGURACIÓN DE COMPRESS
  // ========================================
  compress: true,

  // ========================================
  // CONFIGURACIÓN DE POWERED BY
  // ========================================
  poweredByHeader: false,
};

module.exports = nextConfig;

