/** @type {import('next').NextConfig} */

const { OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '', OTEL_SERVICE_NAME = 'app', DATABASE_URL = '' } = process.env;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.http2 = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.fs = false;
    }

    return config;
  },
  env: {
    DATABASE_URL,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: OTEL_SERVICE_NAME,
  },
};

module.exports = nextConfig;
