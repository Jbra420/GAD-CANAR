/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        // ============================================================
        // PALETA OFICIAL GAD MUNICIPAL DE CAÑAR
        // Extraída del Escudo Provincial
        // ============================================================

        // AZUL — Color principal institucional (Fondo del escudo)
        primary: {
          50:  '#eff6ff',
          400: '#60a5fa',
          DEFAULT: '#2563EB',
          600: '#1D4ED8',
        },

        // ORO / AMARILLO — Estrellas y detalles
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          DEFAULT: '#F5C100',
          600: '#D4A800',
        },

        // VERDE — Árbol del escudo
        success: {
          50:  '#f0fdf4',
          400: '#4ade80',
          DEFAULT: '#22C55E',
          600: '#16A34A',
        },

        // ROJO / FUEGO — Llama superior
        danger: {
          50:  '#fef2f2',
          400: '#f87171',
          DEFAULT: '#EF4444',
          600: '#DC2626',
        },

        // SUPERFICIE — Fondo claro premium
        surface: {
          DEFAULT: '#F8FAFC',   // Slate 50 (Blanco Humo)
          card:    '#FFFFFF',   // Blanco puro
          border:  '#E2E8F0',   // Slate 200 (Bordes)
          muted:   '#F1F5F9',   // Slate 100 (Hover/Muted)
          warm:    '#F8FAFC',   // 
        },
      },

      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':     'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 40%, #E2E8F0 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(37,99,235,0.02) 0%, rgba(255,255,255,0.95) 100%)',
        'gradient-primary':  'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-accent':   'linear-gradient(135deg, #F5C100 0%, #D4A800 100%)',
        'gradient-success':  'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'gradient-danger':   'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'gradient-shield':   'linear-gradient(135deg, #2563EB 0%, #F5C100 50%, #22C55E 100%)',
      },

      boxShadow: {
        'glow-primary': '0 0 30px rgba(37, 99, 235, 0.25)',
        'glow-accent':  '0 0 30px rgba(245, 193, 0, 0.25)',
        'glow-success': '0 0 30px rgba(34, 197, 94, 0.25)',
        'glow-danger':  '0 0 30px rgba(239, 68, 68, 0.25)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover':   '0 8px 40px rgba(37, 99, 235, 0.1)',
        'gold-border':  'inset 0 0 0 1px rgba(37, 99, 235, 0.2)',
      },

      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'spin-slow':  'spin 8s linear infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 10px rgba(37, 99, 235, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
