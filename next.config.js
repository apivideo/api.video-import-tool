/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['i.vimeocdn.com', 'cdn.api.video'],
  },
};

module.exports = nextConfig;
