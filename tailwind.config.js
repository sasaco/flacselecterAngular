/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#507e32',
        'primary-light': '#99c184',
        'disabled-bg': '#808080',
        'border-green': '#70ad47'
      }
    }
  },
  plugins: [],
}

