// Import env here to validate during build
// Note: Removed jiti dependency due to installation issues
// import "./lib/env"; // Comentado temporalmente para evitar errores de módulo

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Configurar límite de tamaño para Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // Permitir hasta 25MB para imágenes
    },
  },
};

export default nextConfig;
