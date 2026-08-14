import type { Config } from 'tailwindcss'

// Central design tokens for the whole app. Changing a value here updates
// every page at once. Brand identity: green (land/nature) + gold (value),
// on a deep emerald background.
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ---- Colors ---------------------------------------------------------
      // Gold scale (value/premium accent). The 200–600 steps keep their
      // original values so existing classes look identical; 50/100/700–900
      // are new steps for finer control (subtle tints, deep borders).
      colors: {
        gold: {
          50: '#FDF9EC',
          100: '#FAF0CE',
          200: '#F5E4A3',
          300: '#EFD56F',
          400: '#E3C24A',
          500: '#C9A227',
          600: '#A8851C',
          700: '#856716',
          800: '#634E13',
          900: '#3F3210',
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
        glow: '0 0 0 1px rgba(227,194,74,0.25), 0 8px 30px -6px rgba(201,162,39,0.45)',
        card: '0 10px 30px -12px rgba(0,0,0,0.55)',
        'card-hover': '0 20px 45px -12px rgba(0,0,0,0.65)',
      },

      // ---- Brand gradient helper -----------------------------------------
      backgroundImage: {
        'brand-radial':
          'radial-gradient(1200px 600px at 15% -10%, rgba(16,185,129,0.18), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(201,162,39,0.14), transparent)',
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
