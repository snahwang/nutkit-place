/** @type {import('tailwindcss').Config} */
export default {
  content: ['./views/**/*.hbs', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070b',
          900: '#0b0f14',
          850: '#0f1620',
          800: '#131b26',
          700: '#1b2636',
        },
        accent: {
          500: '#ff7a18',
          600: '#ff6a00',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,122,24,0.35), 0 10px 30px rgba(0,0,0,0.35)',
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
