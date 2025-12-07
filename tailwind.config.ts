import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-brutalist palette - raw, bold, high contrast
        'cube-black': '#0a0a0a',
        'cube-white': '#f5f5f0',
        'cube-yellow': '#ffd93d',
        'cube-red': '#ff4757',
        'cube-green': '#2ed573',
        'cube-blue': '#3742fa',
        'cube-orange': '#ff7f50',
        'cube-gray': '#2d3436',
        'cube-cement': '#636e72',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        'display': ['"Space Grotesk"', '"Archivo Black"', 'sans-serif'],
        'brutal': ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'count': 'count 0.1s ease-out',
        'ready-pulse': 'readyPulse 0.8s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 217, 61, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 217, 61, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        count: {
          '0%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        readyPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px #0a0a0a',
        'brutal-sm': '4px 4px 0px 0px #0a0a0a',
        'brutal-lg': '12px 12px 0px 0px #0a0a0a',
        'brutal-yellow': '8px 8px 0px 0px #ffd93d',
        'brutal-green': '8px 8px 0px 0px #2ed573',
        'brutal-red': '8px 8px 0px 0px #ff4757',
        'inner-brutal': 'inset 4px 4px 0px 0px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
