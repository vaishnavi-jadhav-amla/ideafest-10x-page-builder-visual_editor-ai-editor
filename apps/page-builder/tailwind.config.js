const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");
const themes = require("tailwindcss-themer");

const tailwindConfig = require(join(__dirname, "../..", "packages/base-components/src/tailwind-config/tailwind.config.js"));
const safetygearTailwindConfig = require(join(__dirname, "../..", "packages/safetygear/tailwind-config/tailwind.config.js"));
const bstoreTailwindConfig = require(join(__dirname, "../..", "packages/bstore/tailwind-config/tailwind.config.js"));
// import your themes

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [tailwindConfig],
  content: [join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {},
  },
  plugins: [
    themes({
      themes: [
        bstoreTailwindConfig,
        safetygearTailwindConfig,
        // add imported themes....
      ],
    }),
  ],
};
