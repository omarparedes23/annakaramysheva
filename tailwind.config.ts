import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        bone: {
          50:  '#FDFCFB',
          100: '#FAF7F4',
          200: '#F5F0EB',
          300: '#EDE4DA',
          400: '#DDD0C3',
          500: '#C8B8A8',
          600: '#A89480',
          700: '#8A7262',
          800: '#6B5448',
          900: '#4A3A31',
        },
        jet: {
          50:  '#F2F2F2',
          100: '#D9D9D9',
          200: '#ABABAB',
          300: '#7D7D7D',
          400: '#525252',
          500: '#2B2B2B',
          600: '#1A1A1A',
          700: '#141414',
          800: '#0F0F0F',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        'display-xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 5vw, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 3.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      letterSpacing: {
        widest: '0.25em',
        superwide: '0.35em',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
        '2/3': '2 / 3',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
