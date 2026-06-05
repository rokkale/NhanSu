/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        sidebar: {
          from: '#0d1f3c',
          to:   '#162e5a',
        },
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(160deg, #0d1f3c 0%, #162e5a 100%)',
        'blue-glow':        'radial-gradient(ellipse at center, rgba(14,165,233,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'blue-glow': '0 0 18px rgba(14,165,233,0.35), 0 0 36px rgba(14,165,233,0.12)',
        'card':      '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 30px rgba(14,165,233,0.15), 0 2px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'active-pulse': 'activePulse 2s ease-in-out infinite',
        'fade-up':      'fadeUp 0.25s ease-out both',
      },
      keyframes: {
        activePulse: {
          '0%':   { transform: 'scale(0.85)', opacity: '0.5' },
          '50%':  { transform: 'scale(1.15)', opacity: '1'   },
          '100%': { transform: 'scale(1)',    opacity: '0.75'},
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)'       },
        },
      },
    },
  },
  plugins: [],
}
