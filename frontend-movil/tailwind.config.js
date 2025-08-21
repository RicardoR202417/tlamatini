/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        }
      }
    },
  },
  plugins: [],
};
