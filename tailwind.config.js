/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HPE brand-inspired color palette
        'hpe-green': {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#01A982', // Primary HPE Green
          600: '#019970',
          700: '#017a5a',
          800: '#015f46',
          900: '#014d39',
        },
        'morpheus': {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d3dbe6',
          300: '#adbdd0',
          400: '#8199b5',
          500: '#627c9d',
          600: '#4d6382',
          700: '#40516a',
          800: '#384559',
          900: '#323c4c',
          950: '#1e242f',
        },
        'slate-dark': '#0a0f1a',
      },
      fontFamily: {
        'display': ['Manrope', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(1, 169, 130, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
