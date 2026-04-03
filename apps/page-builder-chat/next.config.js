//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { svgr: false },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
  webpack(config, { dev }) {
    if (dev) {
      if (process.env.NEXT_DEV_POLL === "1") {
        config.watchOptions = {
          ...config.watchOptions,
          poll: 1000,
        };
      }
    }
    return config;
  },
};

module.exports = composePlugins(withNx)(nextConfig);
