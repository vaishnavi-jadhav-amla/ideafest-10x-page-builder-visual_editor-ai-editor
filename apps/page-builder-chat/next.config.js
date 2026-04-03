//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { svgr: false },
  reactStrictMode: true,
  /** Next.js 15+ only; omitted here so Next 14 (workspace default) does not warn. */
  webpack(config, { dev }) {
    if (dev) {
      // Windows / large repos: if the dev server seems stuck on "Starting...", set NEXT_DEV_POLL=1
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
