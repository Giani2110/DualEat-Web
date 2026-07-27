/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-1": "#ffffff",
        "text-2": "#dbdbdb",
        "text-3": "#1d1d1d",
        "text-4": "#444444",
        "text-5": "#242424",
        "text-6": "#878787",
        "bg-red": "#B53325",
        "bg-yellow": "#e5a657",
        "bg-semi-black": "#333333",

        "bg-gray": "#f5f5f5",
        "bg-semi-white": "#fefefe",
        "bg-blue": "#3578e4",
        "bg-blue-black": "#054FAF",
      },
    },
  },
  plugins: [],
};
