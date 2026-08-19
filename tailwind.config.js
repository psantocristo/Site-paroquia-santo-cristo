/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Cardo', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Cardo', 'Georgia', 'serif'],
      },
      colors: {
        wine: {
          50: '#faf5f5',
          100: '#f2e4e4',
          200: '#e3c1c1',
          300: '#c98686',
          400: '#a04a4a',
          500: '#7a2020',
          600: '#611a1a',
          700: '#4a1414',
          800: '#3c0d0d',
          900: '#2a0808',
        },
        gold: {
          50: '#fbf7ec',
          100: '#f5ecd0',
          200: '#ecd89f',
          300: '#dcbf6d',
          400: '#c9a84c',
          500: '#b58f34',
          600: '#8f6d25',
          700: '#6a501c',
        },
        cream: {
          50: '#fdfbf6',
          100: '#f8f5ef',
          200: '#f0ebe0',
          300: '#e4dcc9',
        },
        red: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9cfcf',
          300: '#f2a8a8',
          400: '#e87575',
          500: '#d64545',
          600: '#b82e2e',
          700: '#952525',
          800: '#7a2020',
          900: '#611a1a',
          950: '#3c0d0d',
        },
        amber: {
          200: '#f5dfa0',
          300: '#f5c843',
          400: '#e8b230',
          500: '#d4a017',
          600: '#b8860b',
        },
      },
      boxShadow: {
        elegant: '0 10px 40px -12px rgba(74, 20, 20, 0.18)',
        gold: '0 4px 20px -6px rgba(201, 168, 76, 0.35)',
      },
      maxWidth: {
        'screen': '100vw',
        'full': '100%',
      },
      width: {
        'screen': '100vw',
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      height: {
        'screen-safe': ['100vh', '100dvh'],
      },
      minHeight: {
        'screen-safe': ['100vh', '100dvh'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.75',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
