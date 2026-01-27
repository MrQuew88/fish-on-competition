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
        // === DEEP WATER TONES ===
        water: {
          deepest: '#152D30',
          deep: '#1A3B3F',
          mid: '#2C4F54',
          surface: '#3D6A6F',
        },

        // === GOLDEN REFLECTIONS ===
        reflect: {
          bright: '#E8A66F',
          gold: '#D4A574',
          amber: '#C9915D',
          subtle: '#B8896A',
        },

        // === MERGED TONES (where water meets reflection) ===
        merged: {
          'teal-gold': '#4A6B5F',
          'dark-amber': '#5C5647',
        },

        // === PRIMARY (water-based) ===
        primary: {
          DEFAULT: '#2C4F54',
          hover: '#3D6A6F',
          dark: '#1A3B3F',
          light: '#E8F4F2',
          50: '#E8F4F2',
          100: '#D1E9E6',
          200: '#A3D3CD',
          300: '#75BDB4',
          400: '#4A9A91',
          500: '#3D6A6F',
          600: '#2C4F54',
          700: '#1A3B3F',
          800: '#152D30',
          900: '#0F2224',
        },

        // === ACCENT (reflection-based) ===
        accent: {
          DEFAULT: '#D4A574',
          hover: '#E8A66F',
          dark: '#C9915D',
          amber: '#C9915D',
          orange: '#E8A66F',
          emerald: '#4A6B5F',
        },

        // === NEUTRAL backbone (slate) ===
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F8FAFC',
          muted: '#F1F5F9',
          border: '#E2E8F0',
          hover: '#CBD5E1',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          inverse: '#FFFFFF',
        },

        // === STATUS indicators ===
        status: {
          active: '#4A6B5F',
          'active-bg': 'rgba(74, 107, 95, 0.1)',
          completed: '#94A3B8',
          pending: '#D4A574',
        },

        // === MEDAL colors (reflection-themed) ===
        medal: {
          gold: '#D4A574',
          'gold-bg': '#FDF8F3',
          silver: '#64748B',
          'silver-bg': '#F1F5F9',
          bronze: '#C9915D',
          'bronze-bg': '#FDF6F0',
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
