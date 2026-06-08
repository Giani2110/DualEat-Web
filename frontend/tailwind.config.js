/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-1": "#ffffff",
        "text-2": "#dbdbdb",
        "text-3": "#2F2F2F",
        "text-4": "#707070",
        "text-5": "#4A4947",
        "text-6": "#878787",
        "bg-red": "#B53325",
        "bg-yellow": "#e5a657",
        "bg-semi-black": "#333333",

        "bg-gray": "#f5f5f5",
        "bg-semi-white": "#fefefe",
        "bg-blue": "#3578e4",
        "bg-blue-black": "#054FAF",
      },

      fontFamily: {
        Outfit: ["Outfit Variable", "sans-serif"],
      },
    },
  },
  plugins: [],
};
