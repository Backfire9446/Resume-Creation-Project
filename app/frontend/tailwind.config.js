/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F9",
        sheet: "#FFFFFF",
        ink: "#1E2A47",
        slate: "#5B6880",
        rule: "#DAE0E8",
        hl: "#FFE36E",
        done: "#2E7A58",
        danger: "#B0432E",
      },
      fontFamily: {
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
