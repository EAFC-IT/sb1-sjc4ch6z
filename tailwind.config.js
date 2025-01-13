/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette de couleurs avec meilleur contraste
        primary: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          200: '#bae2fd',
          300: '#7ccffc',
          400: '#36befa',
          500: '#0ca6eb',  // Couleur principale plus contrastée
          600: '#0288d1',  // Meilleur contraste pour le texte sur fond clair
          700: '#026aa2',  // Meilleur contraste pour le texte sur fond sombre
          800: '#065986',
          900: '#0b4d6e',
        },
        // Couleurs sémantiques avec meilleur contraste
        success: {
          light: '#4ade80',  // Pour les fonds clairs
          DEFAULT: '#16a34a', // Pour le texte et les icônes
          dark: '#166534',    // Pour les fonds sombres
        },
        danger: {
          light: '#f87171',   // Pour les fonds clairs
          DEFAULT: '#dc2626', // Pour le texte et les icônes
          dark: '#991b1b',    // Pour les fonds sombres
        },
        warning: {
          light: '#fbbf24',   // Pour les fonds clairs
          DEFAULT: '#d97706', // Pour le texte et les icônes
          dark: '#92400e',    // Pour les fonds sombres
        },
      },
    },
  },
  plugins: [],
};