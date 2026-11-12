/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        neon: {
          cyan: '#00f0ff',
          teal: '#00e5ff',
          purple: '#a855f7',
          violet: '#8b5cf6',
          fuchsia: '#e879f9',
          pink: '#f43f5e',
          dark: '#07050f',
          card: 'rgba(19, 13, 34, 0.85)',
          border: 'rgba(168, 85, 247, 0.35)',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.55)',
        'neon-cyan-lg': '0 0 30px rgba(0, 240, 255, 0.7)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.45)',
        'neon-purple-lg': '0 0 35px rgba(168, 85, 247, 0.65)',
        'card-glow': '0 0 25px rgba(168, 85, 247, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
