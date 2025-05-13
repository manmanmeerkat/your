/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "377px",
      },
      spacing: {
        18: "4.5rem",
      },
      typography: (theme) => ({
        invert: {
          css: {
            a: {
              color: theme("colors.rose.400"),
              "text-decoration": "underline",
              "text-underline-offset": "4px",
              transition: "color 0.3s ease",
              "&:hover": {
                color: theme("colors.rose.300"),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
