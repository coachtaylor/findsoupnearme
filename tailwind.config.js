// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soup-red': {
          50: '#FFF5F5',
          100: '#FFE2E2',
          200: '#FFB8B8',
          300: '#FF8E8E',
          400: '#F76E6E',
          500: '#E55959',
          600: '#D12C2C',
          700: '#B01F1F',
          800: '#8F1717',
          900: '#6E1010',
        },
        'soup-orange': {
          50: '#FFF9F0',
          100: '#FFF0E5',
          200: '#FFDFCC',
          300: '#FFCAA8',
          400: '#F7941E', // Main orange
          500: '#E88812',
          600: '#D67A0A',
          700: '#BF6B02',
          800: '#A85D00',
          900: '#904F00',
        },
        'soup-brown': {
          50: '#FAF9F7',
          100: '#F5F3EF',
          200: '#E8E4DA',
          300: '#D5CDC0',
          400: '#B7AE9E',
          500: '#A0947F',
          600: '#887D68',
          700: '#706754',
          800: '#5A5243',
          900: '#2E2E2E', // Main brown/black
        },
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'merriweather': ['Merriweather', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
      },
    },
  },
  plugins: [],
};