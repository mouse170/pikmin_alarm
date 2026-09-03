/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oled: {
          DEFAULT: '#000000',
          pure: '#000000',
          card: '#0a0a0a',
          elevated: '#121212',
          border: '#1f1f1f',
          subtle: '#262626'
        },
        pikmin: {
          red: '#ef4444',
          blue: '#3b82f6',
          yellow: '#eab308',
          purple: '#a855f7',
          white: '#f8fafc',
          rock: '#64748b',
          winged: '#ec4899',
          mystery: '#06b6d4',
          fire: '#f97316',
          water: '#0ea5e9',
          electric: '#facc15',
          poison: '#84cc16'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}
