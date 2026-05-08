/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ceff',
          300: '#8aadff',
          400: '#5580ff',
          500: '#2d5aff',
          600: '#1a3ef5',
          700: '#142de0',
          800: '#1625b5',
          900: '#18268f',
          950: '#111760',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f1f3f9',
          200: '#e4e7f1',
          800: '#1e2235',
          850: '#171b2e',
          900: '#111425',
          950: '#0a0c1a',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        shimmer:    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        card:         '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-dark':  '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
        glow:         '0 0 20px rgba(45,90,255,0.35)',
        'glow-sm':    '0 0 10px rgba(45,90,255,0.2)',
        modal:        '0 8px 40px rgba(0,0,0,0.16)',
        'modal-dark': '0 8px 40px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
