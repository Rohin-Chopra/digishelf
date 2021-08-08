const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      primary: '#161032',
      secondary: '#F61067',
      light: '#F4F4ED',
      white: '#f4f4ed',
      pink: colors.pink,
      gray: colors.coolGray,
      transparent: 'transparent',
      red: colors.red,
      green: colors.green
    },
    extend: {
      typography: {
        '3xl': '1.875rem'
      }
    }
  },
  variants: {
    opacity: ({ after }) => after(['disabled']),
    extend: {}
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
}
