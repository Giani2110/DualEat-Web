/ @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arvo: ['Arvo', 'serif'], // Aquí definimos 'arvo' como un nombre para tu fuente
      },
    },
  },
  plugins: [],
}