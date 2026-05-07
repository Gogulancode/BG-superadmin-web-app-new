/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://bg-superadmin-api-production.up.railway.app/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
