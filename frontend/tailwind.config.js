/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark:     '#0D0D0D',
          carbon:   '#141414',
          surface:  '#1C1C1C',
          muted:    '#2A2A2A',
          border:   '#333333',
        },
        light: {
          bg:       '#F5F0EB',
          surface:  '#FFFFFF',
          muted:    '#D4CFC9',
        },
        gold: {
          DEFAULT:  '#DC143C',
          light:    '#E8334F',
          dark:     '#C0122F',
          hover:    '#F04060',
          muted:    'rgba(220, 20, 60, 0.15)',
        },
        cream:     '#F5F0EB',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold':      '0 0 15px rgba(220, 20, 60, 0.2)',
        'gold-lg':   '0 0 30px rgba(220, 20, 60, 0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
