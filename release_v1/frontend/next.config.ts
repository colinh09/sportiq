/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // bad practice but needed for now
    ignoreDuringBuilds: true,
  },
  typescript: {

    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig