/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#070A12',
          800: '#0B1020',
          700: '#121A33',
        },
        neon: {
          blue: '#3B82F6',
          cyan: '#22D3EE',
          gold: '#F5C542',
        },
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        glass: '14px',
      },
    },
  },
  plugins: [],
}
