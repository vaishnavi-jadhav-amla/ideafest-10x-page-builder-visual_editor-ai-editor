// @ts-check
// Import the Tailwind Config type using JSDoc
/**
 * @typedef {import("tailwindcss").Config["theme"]} IExtend
 */
/**
 * @typedef {Object} IThemeConfig
 * @property {string} name - Name of the theme
 * @property {string[]} selectors - Array of selectors for the theme
 * @property {IExtend} extend - Tailwind theme extensions.
 */

/** @type {IThemeConfig} */
const bstoreTailwindConfig = {
  name: "bstore",
  selectors: ["[data-theme='bstore']"],
  extend: {
    colors: {
      primary: "#e11d48",
      secondary: "#14b8a6",
      accent: "#facc15",
      background: "#000000",
      foreground: "#ffffff",
    },
    spacing: {
      72: "18rem",
      96: "24rem",
      120: "30rem",
    },
    boxShadow: {
      neon: "var(--box-shadow-neon, 0 0 15px rgba(225, 29, 72, 0.8))",
    },
    textColor: {
      skin: {
        base: "rgb(255, 255, 255)",
        muted: "rgb(254, 202, 202)",
        inverted: "rgb(220, 38, 38)",
      },
    },
    backgroundColor: {
      skin: {
        fill: "rgb(185, 28, 28)",
        "button-accent": "rgb(255, 255, 255)",
        "button-accent-hover": "rgb(254, 242, 242)",
        "button-muted": "rgb(239, 68, 68)",
      },
    },
    gradientColorStops: {
      skin: {
        hue: "rgb(185, 28, 28)",
      },
    },
  },
};

module.exports = bstoreTailwindConfig;
