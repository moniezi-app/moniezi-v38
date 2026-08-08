/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./tests/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        brand: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        slatebg: "#ffffff",
      },
    },
  },
  plugins: [],
}
