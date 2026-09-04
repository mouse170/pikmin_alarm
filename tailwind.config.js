/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nocturnal Expedition Telemetry + Material Design 3 Tokens
        md: {
          primary: 'var(--md-sys-color-primary)',
          'on-primary': 'var(--md-sys-color-on-primary)',
          'primary-container': 'var(--md-sys-color-primary-container)',
          'on-primary-container': 'var(--md-sys-color-on-primary-container)',

          secondary: 'var(--md-sys-color-secondary)',
          'on-secondary': 'var(--md-sys-color-on-secondary)',
          'secondary-container': 'var(--md-sys-color-secondary-container)',
          'on-secondary-container': 'var(--md-sys-color-on-secondary-container)',

          tertiary: 'var(--md-sys-color-tertiary)',
          'on-tertiary': 'var(--md-sys-color-on-tertiary)',
          'tertiary-container': 'var(--md-sys-color-tertiary-container)',
          'on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',

          error: 'var(--md-sys-color-error)',
          'on-error': 'var(--md-sys-color-on-error)',
          'error-container': 'var(--md-sys-color-error-container)',
          'on-error-container': 'var(--md-sys-color-on-error-container)',

          surface: 'var(--md-sys-color-surface)',
          'on-surface': 'var(--md-sys-color-on-surface)',
          'surface-variant': 'var(--md-sys-color-surface-variant)',
          'on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
          'surface-container-lowest': 'var(--md-sys-color-surface-container-lowest)',
          'surface-container-low': 'var(--md-sys-color-surface-container-low)',
          'surface-container': 'var(--md-sys-color-surface-container)',
          'surface-container-high': 'var(--md-sys-color-surface-container-high)',
          'surface-container-highest': 'var(--md-sys-color-surface-container-highest)',

          background: 'var(--md-sys-color-background)',
          'on-background': 'var(--md-sys-color-on-background)',
          outline: 'var(--md-sys-color-outline)',
          'outline-variant': 'var(--md-sys-color-outline-variant)',
        },
        tactical: {
          cyan: '#94ccff',
          green: '#86db70',
          amber: '#ffba27',
          crimson: '#ff6b6b',
          moss: '#0f1d13',
          border: '#1b3320',
          well: '#070e09',
        },
        garden: {
          bg: '#F4F8F1',
          cream: '#F8FAF6',
          sprout: '#EEF5EA',
          border: '#D6E5D0',
          primary: '#2E9B0F',
          dark: '#182B1B',
          muted: '#556B58',
          amber: '#D97706',
          amberBg: '#FEF3C7',
          rose: '#E11D48',
          sky: '#0284C7',
          skyBg: '#E0F2FE',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '-apple-system', 'sans-serif'],
        garden: ['"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
