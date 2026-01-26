import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep water palette
        depth: {
          50: '#f7f9fb',
          100: '#e8eef3',
          200: '#d1dde7',
          300: '#a8bdd0',
          400: '#7a99b4',
          500: '#5a7a99',
          600: '#486380',
          700: '#3b4f66',
          800: '#334255',
          900: '#2d3948',
          950: '#1e262f',
        },
        // Forest/moss greens
        moss: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#c9d7ca',
          300: '#a3bba5',
          400: '#789a7b',
          500: '#587d5b',
          600: '#456448',
          700: '#38503b',
          800: '#2f4132',
          900: '#28372b',
          950: '#141d16',
        },
        // Warm earth/sand
        earth: {
          50: '#faf9f7',
          100: '#f3f1ec',
          200: '#e6e1d8',
          300: '#d5cdbf',
          400: '#c0b49f',
          500: '#a99a82',
          600: '#998873',
          700: '#7f7060',
          800: '#695d51',
          900: '#574d44',
          950: '#2e2824',
        },
        // Slate accent
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Copper/bronze accent for achievements
        copper: {
          400: '#d4a574',
          500: '#c4956a',
          600: '#a67c52',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.9rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 24px -8px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px -8px rgba(0, 0, 0, 0.15), 0 16px 48px -16px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        'glow-moss': '0 0 20px -4px rgba(88, 125, 91, 0.25)',
        'glow-depth': '0 0 20px -4px rgba(72, 99, 128, 0.25)',
      },
      backgroundImage: {
        'gradient-depth': 'linear-gradient(145deg, #3b4f66 0%, #2d3948 100%)',
        'gradient-moss': 'linear-gradient(145deg, #587d5b 0%, #38503b 100%)',
        'gradient-surface': 'linear-gradient(180deg, #faf9f7 0%, #f3f1ec 100%)',
        'texture-water': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 25 30 30 T60 30' fill='none' stroke='%23e8eef3' stroke-width='1'/%3E%3Cpath d='M0 45 Q15 40 30 45 T60 45' fill='none' stroke='%23e8eef3' stroke-width='1'/%3E%3C/svg%3E")`,
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
export default config;
