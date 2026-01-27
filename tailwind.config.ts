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
        // FishBrain-inspired deep water palette
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        // Vibrant teal/aqua accent - FishBrain signature
        water: {
          50: '#e6fffa',
          100: '#b2f5ea',
          200: '#81e6d9',
          300: '#4fd1c5',
          400: '#38b2ac',
          500: '#319795',
          600: '#2c7a7b',
          700: '#285e61',
          800: '#234e52',
          900: '#1d4044',
        },
        // Success/nature greens
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Trophy gold for achievements
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Silver for 2nd place
        silver: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        // Bronze/copper for 3rd place
        bronze: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.9rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'trophy-glow': 'trophyGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '25%': { transform: 'translateX(-5px) translateY(3px)' },
          '50%': { transform: 'translateX(0) translateY(5px)' },
          '75%': { transform: 'translateX(5px) translateY(3px)' },
        },
        trophyGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.9))' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(16, 42, 67, 0.08), 0 4px 16px -4px rgba(16, 42, 67, 0.06)',
        'medium': '0 4px 20px -4px rgba(16, 42, 67, 0.12), 0 8px 32px -8px rgba(16, 42, 67, 0.08)',
        'strong': '0 8px 40px -8px rgba(16, 42, 67, 0.18), 0 16px 64px -16px rgba(16, 42, 67, 0.12)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(16, 42, 67, 0.06)',
        'glow-water': '0 0 24px -4px rgba(56, 178, 172, 0.4)',
        'glow-gold': '0 0 24px -4px rgba(251, 191, 36, 0.5)',
        'glow-forest': '0 0 24px -4px rgba(34, 197, 94, 0.4)',
        'card': '0 1px 3px rgba(16, 42, 67, 0.08), 0 4px 12px rgba(16, 42, 67, 0.05)',
        'card-hover': '0 4px 20px rgba(16, 42, 67, 0.12), 0 8px 32px rgba(16, 42, 67, 0.08)',
      },
      backgroundImage: {
        // Premium gradients
        'gradient-navy': 'linear-gradient(135deg, #243b53 0%, #102a43 100%)',
        'gradient-water': 'linear-gradient(135deg, #38b2ac 0%, #285e61 100%)',
        'gradient-forest': 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        'gradient-silver': 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
        'gradient-bronze': 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
        // Surface gradients
        'gradient-surface': 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)',
        'gradient-hero': 'linear-gradient(160deg, #102a43 0%, #0a1929 40%, #1d4044 100%)',
        // Wave pattern for hero
        'wave-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,144C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
        // Shimmer effect
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
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
