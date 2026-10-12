/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'black':     '#000000',
        'off-white': '#eff0e9',
        'accent-purple': '#E6C7EB',
        'accent-orange': '#FE602F',
        'accent-teal':   '#64CEBB',
        'accent-yellow': '#F5C645',
      },
      fontFamily: {
        satisfy: ['Satisfy', 'cursive'],
        nunito:  ['Nunito', 'sans-serif'],
        ptsans:  ['"PT Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
