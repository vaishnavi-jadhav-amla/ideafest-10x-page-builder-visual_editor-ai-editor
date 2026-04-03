// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/

const getCurrentBuildId = () => {
  return String(Date.now());
};

const buildNumber = getCurrentBuildId();

const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  generateBuildId: async () => {
    return buildNumber;
  },
  reactStrictMode: false,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript type checking errors during build
  },
  webpack(config, { dev, isServer }) {
    // Enable parallelization for faster compilation
    config.parallelism = 4;
    if (dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    if (!dev) {
      const buildId = buildNumber;
      config.resolve = {
        ...config.resolve,
        symlinks: false,
        // Prevents Webpack from following symlinks in node_modules
      };

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
        },
      };
      config.optimization.minimize = true;
      config.optimization.minimizer = [
        //Added to remove console.logs on build
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: process.env.DISABLE_CONSOLE_LOG === "true" || false,
            },
          },
        }),
      ];

      if (!isServer) {
        config.output.filename = `static/chunks/[name].${buildId}.js`;
        config.output.chunkFilename = `static/chunks/[name].${buildId}.js`;

        config.plugins = config.plugins.filter((plugin) => !(plugin instanceof MiniCssExtractPlugin));

        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: `static/css/[name].[contenthash].${buildId}.css`,
            chunkFilename: `static/css/[name].[contenthash].${buildId}.css`,
          })
        );
      }
      //Added for compression
      config.plugins.push(
        new CompressionPlugin({
          algorithm: "brotliCompress",
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }

    return config;
  },
  transpilePackages: ["lucide-react"],
  cacheHandler: process.env.CACHE_MEMORY === "REDIS" ? require.resolve("./cache-handler.mjs") : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), fullscreen=(self), geolocation=(self)",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:locale/robots.txt",
        destination: "/api/robots",
      },
      {
        source: "/:locale/:slug.xml",
        destination: "/api/sitemap",
      },
      {
        source: "/_next/static/:path*",
        destination: "/fallback.js", 
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(withNextIntl(nextConfig));