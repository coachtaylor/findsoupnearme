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
        serif: ['Fraunces', 'serif'],
        display: ['Cabinet Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FED7D7',
          200: '#FEB2B2',
          300: '#FC8181',
          400: '#F56565',
          500: '#FF6B6B',
          600: '#E53E3E',
          700: '#C53030',
          800: '#9B2C2C',
          900: '#A50E0E',
          DEFAULT: '#FF6B6B',
        },
        secondary: {
          50: '#E6FFFA',
          100: '#B2F5EA',
          200: '#81E6D9',
          300: '#4FD1C5',
          400: '#38B2AC',
          500: '#4ECDC4',
          600: '#319795',
          700: '#2C7A7B',
          800: '#285E61',
          900: '#234E52',
          DEFAULT: '#4ECDC4',
        },
        neutral: {
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923',
          DEFAULT: '#4A5568',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFBF00',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          DEFAULT: '#FFBF00',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-subtle': 'pulsate 2s ease-in-out infinite',
        'steam': 'steam 1.5s ease-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulsate: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        steam: {
          '0%': {
            transform: 'translateY(0) translateX(0) scale(1)',
            opacity: '0.5',
          },
          '100%': {
            transform: 'translateY(-15px) translateX(-5px) scale(1.8)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}