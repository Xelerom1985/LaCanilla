/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bordo: {
          DEFAULT: '#16a34a',
          dark: '#0f7a37',
          light: '#a0002a',
        },
      },
      animation: {
        'pulse-red': 'pulseRed 1.5s ease-in-out infinite',
        'border-glow': 'borderGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        borderGlow: {
          '0%, 100%': { boxShadow: '0 0 6px 2px #facc15' },
          '50%': { boxShadow: '0 0 18px 6px #facc15' },
        },
      },
    },
  },
  plugins: [],
}
