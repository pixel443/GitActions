/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / 1)',
          dark: 'rgb(var(--color-primary) / 0.8)',
          light: 'rgb(var(--color-primary) / 0.3)',
        },
        secondary: 'rgb(var(--color-secondary) / 1)',
        accent: 'rgb(var(--color-accent) / 1)',
        warning: 'rgb(var(--color-warning) / 1)',
        error: {
          DEFAULT: 'rgb(var(--color-error) / 1)',
          dark: 'rgb(var(--color-error) / 0.8)',
        },
        success: 'rgb(var(--color-accent) / 1)',
        background: 'rgb(var(--color-background) / 1)',
        foreground: 'rgb(var(--color-foreground) / 1)',
        muted: 'rgb(var(--color-muted) / 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};