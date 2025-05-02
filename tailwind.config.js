/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        xs: '377px',
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [typography],
}
