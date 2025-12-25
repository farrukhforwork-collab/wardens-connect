/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b0f14'
        },
        accent: {
          500: '#f97316',
          600: '#ea580c'
        }
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans"', '"Noto Sans Arabic"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
