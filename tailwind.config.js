/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#060A12',
          light: '#0D1420',
          mid: '#111827',
        },
        blue: {
          DEFAULT: '#1B7EFF',
          bright: '#3B9BFF',
          dim: '#0A5FCC',
          glow: 'rgba(27,126,255,0.4)',
        },
        gold: {
          DEFAULT: '#C9A84C',
          bright: '#E2C06B',
          dim: '#9A7B30',
        },
        silver: {
          DEFAULT: '#E2E8F0',
          dim: '#94A3B8',
          dark: '#475569',
        },
        graphite: {
          DEFAULT: '#141B2D',
          light: '#1E2A3F',
        },
      },
      fontFamily: {
        display: ['"Inter"', '"DM Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'blue-glow': '0 0 40px -8px rgba(27,126,255,0.5)',
        'blue-glow-lg': '0 0 80px -12px rgba(27,126,255,0.45)',
        'gold-glow': '0 0 30px -6px rgba(201,168,76,0.4)',
        card: '0 20px 60px -20px rgba(0,0,0,0.8)',
        'card-blue': '0 20px 60px -20px rgba(27,126,255,0.15)',
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg,#3B9BFF 0%,#1B7EFF 45%,#0A5FCC 100%)',
        'gold-gradient': 'linear-gradient(135deg,#E2C06B 0%,#C9A84C 45%,#9A7B30 100%)',
        'dark-gradient': 'linear-gradient(180deg,#060A12 0%,#0D1420 100%)',
        'hero-gradient': 'radial-gradient(ellipse 120% 80% at 60% 0%, rgba(27,126,255,0.12) 0%, transparent 60%)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseBlue: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-blue': 'pulseBlue 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
