const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  important: false,
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Georgia', 'serif'],
    },
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#9c27b0',
        error: '#ef5350',
        warning: '#ff9800',
        info: '#03a9f4',
        success: '#4caf50',
        'dark-blue': '#043653',
      },
      backgroundColor: {
        error: '#fdeded',
        warning: '#fff4e5',
        info: '#e5f6fd',
        success: '#edf7ed',
        tooltip: '#3e3434',
        'dark-blue': '#043653',
      },
      borderColor: {
        tooltip: '#3e3434',
      },
      spacing: {
        1.25: '0.3125rem', // 5px
        2.5: '0.625rem', // 10px
        4.5: '1.125rem', // 18px
        7.5: '1.875rem', // 30px
        8.75: '2.1875rem', // 35px
        10.5: '2.625rem', // 42px
        11.5: '2.875rem', // 46px
        12.5: '3.125rem', // 50px
        15: '3.75rem', // 60px
        17.5: '4.375rem', // 70px
        22: '5.5rem', // 88px
        22.5: '5.625rem', // 90px
        25: '6.25rem', // 100px
        '2/5': '40%',
      },
      fontSize: {
        10: '0.625rem', // 10px
        21: '1.3125rem', // 21px
        32: '2rem', // 32px
        42: '2.625rem', // 42px
        45: '2.8125rem', // 45px
      },
      keyframes: {
        toast: {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      animation: {
        toast: 'toast 0.8s ease-in-out',
      },
    },
  },
  variants: { extend: { typography: ['dark'] } },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('daisyui'),
    plugin(({ addComponents }) => {
      addComponents({
        '.text-shorten': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      });
    }),
  ],
  daisyui: {
    themes: false,
  },
};
