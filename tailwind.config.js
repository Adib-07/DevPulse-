/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './stitch_jc_e_dark_theme_ui_redesign/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base / Ink Obsidian Palette
        ink: {
          base: '#090A0F',
          surface: '#12131A',
          raised: '#181A22',
          border: '#222532',
          subtle: '#2C303B',
        },
        'bg-deep': '#090A0F',
        'bg-base': '#111319',
        'bg-card': '#161821',
        'bg-card-hover': '#1C1F2B',
        'bg-elevated': '#222634',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(167, 139, 250, 0.35)',
        'border-strong': 'rgba(255, 255, 255, 0.16)',

        // Lavender & Violet Spectrum
        lavender: {
          light: '#DDD6FE',
          DEFAULT: '#C4B5FD',
          glow: 'rgba(196, 181, 253, 0.25)',
        },
        indigo: {
          DEFAULT: '#8B5CF6',
          bright: '#818CF8',
          deep: '#4F46E5',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        violet: {
          DEFAULT: '#A78BFA',
          bright: '#C4B5FD',
          dark: '#6D3BD7',
          glow: 'rgba(167, 139, 250, 0.3)',
        },

        // Emerald & Mint Spectrum
        mint: {
          light: '#6EE7B7',
          DEFAULT: '#34D399',
          glow: 'rgba(52, 211, 153, 0.25)',
        },
        neon: {
          green: '#10B981',
          'green-glow': 'rgba(16, 185, 129, 0.3)',
          red: '#F43F5E',
          'red-glow': 'rgba(244, 63, 94, 0.3)',
          amber: '#F59E0B',
          'amber-glow': 'rgba(245, 158, 11, 0.3)',
        },
        emerald: {
          dark: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(167, 139, 250, 0.25), 0 0 20px -4px rgba(139, 92, 246, 0.15)',
        'indigo-glow': '0 0 28px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.2)',
        'violet-glow': '0 0 28px rgba(167, 139, 250, 0.25), 0 0 0 1px rgba(167, 139, 250, 0.2)',
        'lavender-glow': '0 0 24px rgba(196, 181, 253, 0.2)',
        'green-glow': '0 0 24px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.2)',
        'red-glow': '0 0 24px rgba(244, 63, 94, 0.25), 0 0 0 1px rgba(244, 63, 94, 0.2)',
        'amber-glow': '0 0 24px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.2)',
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
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
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
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.25s ease both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.1s ease-in-out infinite',
        'alert-shake': 'alert-shake 0.5s ease-in-out 2',
        'secure-sweep': 'secure-sweep 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'spin-slow': 'spin-slow 3s linear infinite',
        'shimmer': 'shimmer 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

