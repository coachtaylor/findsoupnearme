// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Sophisticated teal/blue-green
        primary: {
          50: '#F0F9FA',
          100: '#E0F2F4',
          200: '#B8E4E9',
          300: '#8DD1D9',
          400: '#5BB8C4',
          500: '#21808D', // Main primary color
          600: '#1C6B77',
          700: '#175A64',
          800: '#134A52',
          900: '#0F3A41',
        },
        // Background: Clean cream/off-white
        background: {
          50: '#FEFEFD',
          100: '#FDFDFB',
          200: '#FCFCF9', // Main background color
          300: '#FAFAF6',
          400: '#F8F8F3',
          500: '#F6F6F0',
        },
        // Accent: Warm copper/orange-red
        accent: {
          50: '#FDF6F4',
          100: '#FAEDE8',
          200: '#F5D5CC',
          300: '#EEB8A8',
          400: '#E5957A',
          500: '#A84B2F', // Main accent color
          600: '#8F3F28',
          700: '#763422',
          800: '#5D2A1C',
          900: '#442016',
        },
        // Orange: Burnt orange and light orange accents
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Burnt orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Light Orange: Softer orange tones
        'light-orange': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Light orange
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutrals: Charcoals and cool grays
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#80868B',
          700: '#5F6368',
          800: '#3C4043',
          900: '#202124', // Main text color
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