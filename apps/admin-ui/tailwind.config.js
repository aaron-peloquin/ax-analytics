/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#a855f7',
          magenta: '#ec4899',
          cyan: '#06b6d4',
          violet: '#7c3aed',
          dark: '#0a0512',
          panel: 'rgba(22, 13, 38, 0.75)',
          border: 'rgba(168, 85, 247, 0.25)',
          glow: 'rgba(168, 85, 247, 0.4)'
        }
      },
      boxShadow: {
        'neon-purple': '0 0 25px rgba(168, 85, 247, 0.35)',
        'neon-pink': '0 0 25px rgba(236, 72, 153, 0.35)',
        'neon-cyan': '0 0 25px rgba(6, 182, 212, 0.35)'
      }
    },
  },
  plugins: [],
}
