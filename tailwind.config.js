/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        accent: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04'
        }
      },
      borderRadius: {
        card: '16px',
        btn: '12px'
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}
