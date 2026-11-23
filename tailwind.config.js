/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./*.html",
    "./sheikha_*.py"
  ],
  theme: {
    extend: {
      colors: {
        sheikha: {
          bg: '#040E0B',
          card: '#0A241D',
          deep: '#071D17',
          gold: '#F0C477',
          teal: '#34D399',
          dim: '#8DBFA3',
          text: '#D9E8E0'
        },
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853'
        },
        meta: {
          blue: '#0064E0'
        }
      },
      fontFamily: {
        sheikha: ['Tajawal', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
