/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        easy: { DEFAULT: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        medium: { DEFAULT: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        hard: { DEFAULT: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
      },
      fontFamily: { mono: ['Fira Code', 'Cascadia Code', 'Consolas', 'monospace'] },
    },
  },
  plugins: [],
}
