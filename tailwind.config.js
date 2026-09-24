/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1420',
        surface: '#171c2b',
        'surface-light': '#212739',
        border: '#2a3142',
        teal: { DEFAULT: '#2dd4bf', light: '#5eead4' },
        purple: '#a78bfa',
        gold: '#fbbf24',
      },
    },
  },
  // Safelist dynamically-built class names (colorClasses() in iconRegistry.js
  // constructs `bg-${color}` strings by string-replacing `text-` -> `bg-` at
  // runtime, which the JIT scanner can't see statically).
  safelist: [
    'bg-purple', 'bg-blue-400', 'bg-orange-400', 'bg-teal', 'bg-gold',
    'bg-green-400', 'bg-pink-300',
    'text-purple', 'text-blue-400', 'text-orange-400', 'text-teal', 'text-gold',
    'text-green-400', 'text-pink-300',
  ],
  plugins: [],
}
