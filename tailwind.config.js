// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(table|checkbox|form|spacer).js",
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