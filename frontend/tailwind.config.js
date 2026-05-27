/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B21B6',
        'text-primary': '#171717',
        'text-secondary': '#727272',
        'bg-primary': '#FAF8F5',
        'border-light': '#E2E2E2',
        'border-medium': '#BABABA',
        'table-header': '#F6F6F6',
        'status-success': '#10b981',
        'status-warning': '#f59e0b',
        'status-info': '#8b5cf6',
        'status-error': '#ef4444',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
      },
      boxShadow: {
        'subtle': '0px 2px 6px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
