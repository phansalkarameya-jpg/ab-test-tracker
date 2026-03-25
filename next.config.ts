import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@react-pdf/renderer', '@react-pdf/pdfkit'],
};

export default nextConfig;
