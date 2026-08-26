import type { Config } from 'tailwindcss'

// Central design tokens for the whole app. Changing a value here updates
// every page at once. One accent colour carries the brand; green, amber and
// on a light, low-contrast working surface.
//
// LIGHT THEME NOTE
// The UI was originally authored dark-first: light text (text-emerald-100,
// text-white) on dark panels. Rather than rewrite ~1,900 utility classes,
// the two scales those classes use are redefined here so the same markup
// renders light. Each step is mapped to the ROLE it plays in the markup,
// not to a lighter shade of green:
//   emerald 50/100/200 -> text (strongest / body / muted)
//   emerald 300-600    -> the green accent itself (kept green)
//   emerald 700-900    -> borders and raised surfaces
//   emerald 950        -> stays dark: it is only ever the label on an accent
//                          button (text-emerald-950), never a background
//   white              -> the darkest ink, so text-white reads as a heading
//                          and bg-white/5 becomes a faint grey wash
// Real white (report paper) is `paper`, which the swap above cannot cover.
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ---- Colors ---------------------------------------------------------
      // Accent scale. 100-300 are readable accent *text* on white; 400-600
      // original values so existing classes look identical; 50/100/700–900
      // are new steps for finer control (subtle tints, deep borders).
      colors: {
        // Reads as ink, not as a surface. See the LIGHT THEME NOTE above.
        white: '#000000',
        // Real white, for the report sheet and anything that must be paper.
        paper: '#FFFFFF',
        // Page and panel surfaces.
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F1F2F4',
          sunken: '#F6F7F8',
        },
        // Status colours. The light steps of the stock scales were meant for
        // light-on-dark; on a white page they fail contrast, so 100-300 are
        // darkened while 400+ stay usable as dots, fills and borders.
        sky: {
          50: '#EFF8FF',
          100: '#0B4A66',
          200: '#0E5C7D', // info text, current-step label
          300: '#10688C',
          400: '#2E90BE', // rings, borders
          500: '#1E7FA8', // fills
          600: '#12657F',
          700: '#0E4F66',
          800: '#0A3A4B',
          900: '#072732',
        },
        red: {
          50: '#FEF2F2',
          100: '#B91C1C',
          200: '#B42318',
          300: '#B42318', // error text
          400: '#E45B4C', // borders, dots
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#601414',
        },
        amber: {
          50: '#FFFBEB',
          100: '#8A5A05',
          200: '#92610A', // warning text
          300: '#9A680E',
          400: '#D97706',
          500: '#B45309',
          600: '#92400E',
          700: '#78350F',
          800: '#5C2A0C',
          900: '#451F09',
        },
        emerald: {
          50: '#000000', // strongest text
          100: '#111111', // body text
          200: '#3F3F46', // muted text
          300: '#1585B2', // accent (blue)
          400: '#1E96C8', // accent (blue)
          500: '#177FA9',
          600: '#12657F',
          700: '#E5E7EB', // borders
          800: '#F1F2F4', // raised surface
          900: '#F6F7F8', // page surface
          950: '#0A0A0A', // ink on accent — never a background
        },
        accent: {
          50: '#EAF6FC', // faint tint
          100: '#0B4A66', // accent text (AA on white)
          200: '#0E5C7D', // accent text
          300: '#10688C', // accent text, borders
          400: '#1E96C8', // accent fill (palette blue)
          500: '#177FA9', // primary fill
          600: '#12657F', // fill hover
          700: '#0E4F66',
          800: '#0A3A4B',
          900: '#072732',
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
        glow: '0 0 0 1px rgba(30, 150, 200,0.25), 0 8px 30px -6px rgba(23, 127, 169,0.45)',
        card: '0 1px 2px rgba(18,49,42,0.05), 0 8px 24px -16px rgba(18,49,42,0.16)',
        'card-hover': '0 1px 2px rgba(18,49,42,0.06), 0 16px 36px -18px rgba(18,49,42,0.22)',
      },

      // ---- Brand gradient helper -----------------------------------------
      backgroundImage: {
        'brand-radial':
          'radial-gradient(1200px 600px at 15% -10%, rgba(30, 150, 200,0.06), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(23, 127, 169,0.05), transparent)',
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
