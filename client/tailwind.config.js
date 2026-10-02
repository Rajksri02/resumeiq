/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-ink': '#0B0F19',
        'brand-white': '#FFFFFF',
        'brand-pearl': '#F4F5F8',
        'brand-emerald': '#0A8754',
        'brand-coral': '#E76F51',
        'brand-crimson': '#9E2A2B',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        display: ['Chivo', 'sans-serif'],
      },
      boxShadow: {
        'audit': '0 4px 20px -2px rgba(11, 15, 25, 0.05)',
      }
    },
  },
  plugins: [],
}
