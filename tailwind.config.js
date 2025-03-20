// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|dropdown|form|input|modal|number-input|select|table|ripple|spinner|menu|divider|popover|listbox|scroll-shadow|checkbox|spacer).js"
],
  theme: {
    extend: { 
      colors: {
        customOrange: '#FC9D25',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};