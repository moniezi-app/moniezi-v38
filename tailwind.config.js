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
      // MONIEZI compact-radius system: keep the same hierarchy while making
      // cards, panels, fields, and buttons visibly less rounded app-wide.
      // `rounded-full` remains Tailwind's default for intentional circles/pills.
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "5px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        "3xl": "14px",
      },
    },
  },
  plugins: [],
}
