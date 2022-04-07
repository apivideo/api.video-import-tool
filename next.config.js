/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.vimeocdn.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/vimeo',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
