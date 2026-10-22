/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#0D0E12',
          surface: '#14161C',
          raised: '#1A1D26',
          border: '#23262F',
          subtle: '#2C303B',
        },
        indigo: {
          DEFAULT: '#6366F1',
          bright: '#818CF8',
          deep: '#4F46E5',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          bright: '#A78BFA',
        },
        neon: {
          green: '#22E58A',
          red: '#FF4D5E',
          amber: '#FFB13D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        'indigo-glow': '0 0 0 1px rgba(99,102,241,0.25), 0 12px 40px -16px rgba(99,102,241,0.45)',
        'violet-glow': '0 0 0 1px rgba(139,92,246,0.22), 0 12px 40px -16px rgba(139,92,246,0.4)',
        'green-glow': '0 0 0 1px rgba(34,229,138,0.3), 0 8px 30px -12px rgba(34,229,138,0.35)',
        'red-glow': '0 0 0 1px rgba(255,77,94,0.3), 0 8px 30px -12px rgba(255,77,94,0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'alert-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-1px)' },
          '40%': { transform: 'translateX(1px)' },
          '60%': { transform: 'translateX(-0.5px)' },
          '80%': { transform: 'translateX(0.5px)' },
        },
        'secure-sweep': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '40%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'wave': 'wave 1.1s ease-in-out infinite',
        'alert-shake': 'alert-shake 0.5s ease-in-out 2',
        'secure-sweep': 'secure-sweep 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
};
