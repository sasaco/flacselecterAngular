const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#507e32',        // ボタン濃い
        'primary-light': '#99c184', // ボタン薄い
        'disabled-bg': '#808080',   // 無効なINPUTの背景色
        'border-green': '#70ad47',  // ボーダーライン
        'nav-text': 'khaki',
        'alert': '#aa0000',        // Alert text color
        'input-border': '#767676'  // Input border color
      }
    }
  },  
  plugins: [
    plugin(/** @param {PluginAPI} api */ function({ addBase }) {
      addBase({
        'img': {
          'max-width': 'none'
        }
      })
    })
  ]
}

