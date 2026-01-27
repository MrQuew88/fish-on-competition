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
        // === PRIMARY: Ocean/Teal family ===
        primary: {
          DEFAULT: '#0F766E',  // teal-700 - main brand
          hover: '#0D9488',    // teal-600
          dark: '#115E59',     // teal-800
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },

        // === NEUTRAL backbone (slate) ===
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F8FAFC',       // slate-50
          muted: '#F1F5F9',    // slate-100
          border: '#E2E8F0',   // slate-200
          hover: '#CBD5E1',    // slate-300
        },
        text: {
          primary: '#0F172A',  // slate-900
          secondary: '#64748B', // slate-500
          muted: '#94A3B8',    // slate-400
          inverse: '#FFFFFF',
        },

        // === ACCENT colors (use sparingly) ===
        accent: {
          amber: '#D97706',    // amber-600 - achievements
          orange: '#F97316',   // orange-500 - alerts
          emerald: '#059669',  // emerald-600 - success
        },

        // === STATUS indicators ===
        status: {
          active: '#059669',   // emerald-600
          'active-bg': 'rgba(5, 150, 105, 0.1)',
          completed: '#94A3B8', // slate-400
          pending: '#F59E0B',  // amber-500
        },

        // === MEDAL colors (subtle) ===
        medal: {
          gold: '#D97706',
          'gold-bg': '#FFFBEB',
          silver: '#64748B',
          'silver-bg': '#F1F5F9',
          bronze: '#EA580C',
          'bronze-bg': '#FFF7ED',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        'lg': '0.5rem',   // 8px
        'xl': '0.75rem',  // 12px
        '2xl': '1rem',    // 16px - max for cards
      },

      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'elevated': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
