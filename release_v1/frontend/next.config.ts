/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // bad practice but needed for now
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['a.espncdn.com'],
  },
}

module.exports = nextConfig