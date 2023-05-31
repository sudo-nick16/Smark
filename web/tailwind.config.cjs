/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // colors: {
    //     "white": "#fff",
    //     "black": "#000",
    // },
    extend: {
      colors: {
        "dark-gray": "#1D1D1D",
        "md-gray": "#9B9B9B",
        "light-gray": "#252525",
      },
      screens: {
        xxs: "380px",
        xs: "480px",
        "2xs": "570px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        "1.5lg": "1100px",
        xl: "1280px",
        "1.5xl": "1440px",
        "2xl": "1536px",
        "3xl": "1800px",
        "4xl": "2020px",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
