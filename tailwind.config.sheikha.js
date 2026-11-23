module.exports = {
  darkMode: 'class',
  content: [
    './*.html',
    './templates/**/*.html',
    './static/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        sheikha: {
          bg: '#040E0B',
          card: '#0A241D',
          deep: '#071D17',
          gold: '#F0C477',
          'gold-light': '#FDE68A',
          teal: '#34D399',
          border: 'rgba(240, 196, 119, 0.25)',
          muted: '#8DBFA3'
        },
        meta: {
          blue: '#0064E0',
          hover: '#0052b8',
          light: 'rgba(0, 100, 224, 0.12)'
        },
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853'
        }
      },
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace']
      }
    }
  },
  plugins: []
};
