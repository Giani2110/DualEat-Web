/ @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dosis: ['Dosis', 'sans-serif'], // Aquí definimos 'dosis' como un nombre para tu fuente
      },
    },
  },
  plugins: [],
}