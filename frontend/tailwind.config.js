/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
      },
      boxShadow: {
        card: '0 10px 40px -10px rgba(15, 23, 42, 0.12)',
        'card-hover': '0 20px 50px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
