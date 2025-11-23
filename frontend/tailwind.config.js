/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // Green
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          DEFAULT: '#7C3AED', // main purple
          50:  '#F5F3FF',
          100: '#EEE7FF',
          200: '#DDD0FF',
          300: '#C7B0FF',
          400: '#A881FF',
          500: '#7C3AED', //  same as DEFAULT
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1A9A',
          900: '#32166F',
        },
        primaryPurple: {
          DEFAULT: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}