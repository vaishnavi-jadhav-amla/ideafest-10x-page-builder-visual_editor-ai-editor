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
const safetygearTailwindConfig = {
  name: "safetygear",
  selectors: ["[data-theme='safetygear']"],
  extend: {
    colors: {
      primary: "#1e40af",
      secondary: "#1e293b",
      accent: "#3b82f6",
      background: "#f9fafb",
      foreground: "#111827",
    },
    spacing: {
      cardPadding: "1rem",
      sectionMargin: "2rem",
    },
    textColor: {
      skin: {
        base: "rgb(255, 255, 255)",
        muted: "rgb(199, 210, 254)",
        inverted: "rgb(79, 70, 229)",
      },
    },
    backgroundColor: {
      skin: {
        fill: "rgb(67, 56, 202)",
        "button-accent": "rgb(255, 255, 255)",
        "button-accent-hover": "rgb(238, 242, 255)",
        "button-muted": "rgb(99, 102, 241)",
      },
    },
    gradientColorStops: {
      skin: {
        hue: "rgba(67, 56, 202, 0.5)",
      },
    },
    borderRadius: {
      none: "0 0px",
      md: "0.5rem",
      lg: "1rem",
    },
  },
};

module.exports = safetygearTailwindConfig;
