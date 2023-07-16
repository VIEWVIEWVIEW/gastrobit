const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /./
    },
  ],
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
        cyan: colors.cyan,
        taubmanspurple: {
          50: "#F5EBEE",
          100: "#EAD7DD",
          200: "#D4ABB8",
          300: "#BF8295",
          400: "#AA5A73",
          500: "#814256",
          600: "#693646",
          700: "#4E2834",
          800: "#331A22",
          900: "#1B0E12",
          950: "#0D0709"
        },
        "sepia": {
          50: "#FBF5F3",
          100: "#F8EAE8",
          200: "#F0D5D1",
          300: "#EAC4BD",
          400: "#E2AFA6",
          500: "#DB9A8F",
          600: "#CA6A59",
          700: "#A64635",
          800: "#6C2E23",
          900: "#361711",
          950: "#1B0B09"
        },
        "sentrysilver": {
          50: "#FDFCFB",
          100: "#FCFAF8",
          200: "#FAF7F4",
          300: "#F7F2ED",
          400: "#F4EDE6",
          500: "#F2E9E1",
          600: "#D5B89F",
          700: "#BA895F",
          800: "#845C39",
          900: "#402D1C",
          950: "#20160E"
        }
      },
    },
  },
  plugins: [
    // ...
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require("daisyui")
  ],
  daisyui: {
    styled: true,
    themes: ["cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    darkTheme: "dark",
  },
}

