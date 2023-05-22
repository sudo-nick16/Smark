/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
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
            }
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
    ],
}
