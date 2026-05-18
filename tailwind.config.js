/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        coal: '#0b0b0d',
        graphite: '#141417',
        pink: {
          DEFAULT: '#ff2e88',
          soft: '#ff6fb3',
          deep: '#d6126a',
        },
        silver: {
          DEFAULT: '#dfe3ea',
          dim: '#9aa0ad',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(255,46,136,0.55)',
        'glow-lg': '0 0 80px -12px rgba(255,46,136,0.5)',
        card: '0 20px 60px -20px rgba(255,46,136,0.35)',
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg,#ff6fb3 0%,#ff2e88 45%,#d6126a 100%)',
        'silver-gradient': 'linear-gradient(135deg,#ffffff 0%,#dfe3ea 40%,#9aa0ad 100%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-26px) translateX(14px)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(30px) translateX(-18px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'floatSlow 13s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'pulse-glow': 'pulseGlow 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
