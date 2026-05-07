/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.qrserver.com', 'images.unsplash.com'],
  },
  // Optional: If you want to use the app router specifically
  experimental: {
    // any experimental features
  },
};

module.exports = nextConfig;
