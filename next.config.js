/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/seed/**',
      },
      {
        protocol: 'https',
        hostname: 'app.hotwork.ag',
        port: '',
        pathname: '/asset/images/protocols/ventilator/**',
      },
      {
        protocol: 'https',
        hostname: 'app.hotwork.ag',
        port: '',
        pathname: '/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/ventilator/**',
      },
      {
        protocol: 'https',
        hostname: 'hotware.blob.core.windows.net',
        port: '',
        pathname: '/apps/Hotware/app/**',
      },
    ],
  }
}

module.exports = nextConfig
