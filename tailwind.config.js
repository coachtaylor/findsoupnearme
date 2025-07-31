// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        'soup-red': {
          50: '#fff5f5',
          100: '#fed7d7',
          200: '#feb2b2',
          300: '#fc8181',
          400: '#f56565',
          500: '#e53e3e',
          600: '#c53030',
          700: '#9b2c2c',
          800: '#822727',
          900: '#63171b',
          DEFAULT: '#e53e3e',
        },
        'soup-orange': {
          50: '#fffaf0',
          100: '#feebcb',
          200: '#fbd38d',
          300: '#f6ad55',
          400: '#ed8936',
          500: '#dd6b20',
          600: '#c05621',
          700: '#9c4221',
          800: '#7b341e',
          900: '#652b19',
          DEFAULT: '#dd6b20',
        },
        'soup-brown': {
          50: '#FAF6F2',
          100: '#F0E5D9',
          200: '#E1CBB3',
          300: '#D2B18D',
          400: '#C39768',
          500: '#B47D42',
          600: '#906435',
          700: '#6C4C28',
          800: '#48331B',
          900: '#24190D',
          DEFAULT: '#B47D42',
        },
        'soup-cream': '#FAF6F2',
      },
      animation: {
        steam: 'steam 1.5s ease-out infinite',
      },
      keyframes: {
        steam: {
          '0%': {
            transform: 'translateY(0) translateX(0) scale(1)',
            opacity: '0.3',
          },
          '100%': {
            transform: 'translateY(-10px) translateX(-5px) scale(1.5)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};