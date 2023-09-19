/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['i.vimeocdn.com', 'cdn.api.video', 'vod.api.video', 'embed-ssl.wistia.com'],
  },
};

module.exports = nextConfig;
