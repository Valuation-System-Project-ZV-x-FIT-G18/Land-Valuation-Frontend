import type { Config } from 'tailwindcss'

// Central design tokens for the whole app. The visual identity follows the
// Meridian reference: deep navy, confident blue, bright cyan and cool whites.
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ---- Colors ---------------------------------------------------------
      // Gold scale (value/premium accent). The 200–600 steps keep their
      // original values so existing classes look identical; 50/100/700–900
      // are new steps for finer control (subtle tints, deep borders).
      colors: {
        brand: {
          navy: '#0F2D4F',
          deep: '#0A2442',
          blue: '#1E5799',
          cyan: '#0799D3',
          pale: '#F2F6FC',
          line: '#D8E3F0',
          ink: '#111827',
        },
        // Legacy emerald utilities are intentionally remapped to navy/blue so
        // older screens inherit the current brand without one-off overrides.
        emerald: {
          50: '#F2F6FC',
          100: '#E4EDF7',
          200: '#C9D9EA',
          300: '#91B5D5',
          400: '#4C8BC0',
          500: '#2870AD',
          600: '#1E5799',
          700: '#174878',
          800: '#123A63',
          900: '#0F2D4F',
          950: '#0A2442',
        },
        gold: {
          50: '#EAF8FD',
          100: '#D3F1FB',
          200: '#A8E3F5',
          300: '#67CAEA',
          400: '#18ADDC',
          500: '#0799D3',
          600: '#087FB2',
          700: '#0B668E',
          800: '#105674',
          900: '#104760',
        },
      },

      // ---- Typography -----------------------------------------------------
      // Sora = expressive headings, Inter = clean body text. Both loaded in
      // index.html; system fonts are the fallback while they download.
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ---- Elevation ------------------------------------------------------
      // Reusable shadows so panels/CTAs feel layered and premium.
      boxShadow: {
        glow: '0 0 0 1px rgba(7,153,211,0.24), 0 8px 30px -6px rgba(30,87,153,0.34)',
        card: '0 10px 30px -12px rgba(0,0,0,0.55)',
        'card-hover': '0 20px 45px -12px rgba(0,0,0,0.65)',
      },

      // ---- Brand gradient helper -----------------------------------------
      backgroundImage: {
        'brand-radial':
          'radial-gradient(1200px 600px at 15% -10%, rgba(30,87,153,0.16), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(7,153,211,0.12), transparent)',
      },

      // ---- Motion ---------------------------------------------------------
      // Short, GPU-friendly animations (opacity/transform only) used for
      // page entrances, card reveals, and loading shimmers.
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
