module.exports = {
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  important: false,
  theme: {
    extend: {
      colors: {
        correct: '#6aaa64',
        present: '#c9b458',
        night: '#121213',
        tile: '#787c7e', // 타일색
        absent: '#3a3a3c',
        key: '#818384',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
